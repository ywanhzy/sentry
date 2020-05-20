from __future__ import absolute_import

from django.http import Http404

from sentry.api.bases.integration import IntegrationEndpoint
from sentry.api.permissions import SentryPermission
from sentry.models import Integration, Organization, OrganizationIntegration

# TODO 0.4 rename
class OrganizationIntegrationsPermission(SentryPermission):
    scope_map = {
        "POST": ["org:write"],
    }

class OrganizationIntegrationBaseEndpoint(IntegrationEndpoint):
    """ TODO 0.1 describe """

    def get_organization_integration(organization, integration_id):
        """
        TODO 0.2 describe
        This will still return migrations that are pending deletion.
        """
        try:
            return OrganizationIntegration.objects.get(
                integration_id=integration_id,
                organization=organization,
            )
        except OrganizationIntegration.DoesNotExist:
            raise Http404

    # TODO 1.1 why does this need an organization?
    def get_integration(organization, integration_id):
        """ TODO 0.3 describe """
        try:
            return Integration.objects.get(id=integration_id, organizations=organization)
        except Integration.DoesNotExist:
            raise Http404
