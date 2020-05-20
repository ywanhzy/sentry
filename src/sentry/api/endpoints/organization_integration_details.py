from __future__ import absolute_import

from uuid import uuid4

import six
from django.http import Http404

from sentry.api.bases.organization import OrganizationIntegrationsPermission
from sentry.api.bases.organization_integrations import OrganizationIntegrationBaseEndpoint
from sentry.api.serializers import serialize
from sentry.models import Integration, ObjectStatus, OrganizationIntegration
from sentry.shared_integrations.exceptions import IntegrationError
from sentry.tasks.deletion import delete_organization_integration


class OrganizationIntegrationDetailsEndpoint(OrganizationIntegrationBaseEndpoint):
    permission_classes = (OrganizationIntegrationsPermission,)

    def get(self, request, organization, integration_id):
        org_integration = self.get_organization_integration(organization, integration_id)

        return self.respond(serialize(org_integration, request.user))

    def delete(self, request, organization, integration_id):
        # Removing the integration removes the organization
        # integrations and all linked issues.
        org_integration = self.get_organization_integration(organization, integration_id)

        updated = OrganizationIntegration.objects.filter(
            id=org_integration.id, status=ObjectStatus.VISIBLE
        ).update(status=ObjectStatus.PENDING_DELETION)

        if updated:
            delete_organization_integration.apply_async(
                kwargs={
                    "object_id": org_integration.id,
                    "transaction_id": uuid4().hex,
                    "actor_id": request.user.id,
                },
                countdown=0,
            )

        return self.respond(status=204)

    def post(self, request, organization, integration_id):
        integration = self.get_integration(organization, integration_id)
        installation = integration.get_installation(organization.id)
        try:
            installation.update_organization_config(request.data)
        except IntegrationError as e:
            return self.respond({"detail": six.text_type(e)}, status=400)

        return self.respond(status=200)
