from __future__ import absolute_import

from django.core.urlresolvers import reverse

from rest_framework.response import Response

from sentry import options
from sentry.api.bases.organization_integrations import (
    OrganizationIntegrationBaseEndpoint,
    OrganizationIntegrationsPermission,
)
from sentry.models import Integration, OrganizationMember
from sentry.utils.email import MessageBuilder
from sentry.utils.http import absolute_uri


class OrganizationIntegrationRequestEndpoint(OrganizationIntegrationBaseEndpoint):
    permission_classes = (OrganizationIntegrationsPermission,)

    def post(self, request, organization, integration_id):
        """
        Email the default organization owner asking to install an integration.
        ``````````````````````````````````````````````````````````````````````

        TODO 0.0 descibe why this exists.

        :param string message: Optional message from the requester to the owner.
        """
        # Check for the integrations existence first.
        integration = Integration.objects.get(id=integration_id)
        if not integration:
            return Response({"detail": "Invalid Integration ID"}, status=400)

        # If for some reason the user had permissions all along, silently fail.
        requester = request.user
        if requester.id in map(lambda user: user.id, organization.get_owners()):
            return Response({"detail": "User can install integration"}, status=200)

        # In the edge case where an admin adds the integration between the user
        # seeing and clicking the button, just silently fail.
        installed_integration = self.get_organization_integration(organization, integration.id)
        if installed_integration and installed_integration.status == ObjectStatus.ACTIVE:
            return Response({"detail": "Integration already installed"}, status=200)

        # TODO 2.0 figure out url
        url = ""

        context = {
            "email": requester.email,
            "requester_name": requester.name,
            "organization_name": organization.slug,
            "integration_name": integration.name,
            "url": url,
        }

        # Sanatize the user input before sending it in an email.
        message_option = request.data.get("message", "").strip()
        if message_option:
            # TODO 2.1 sanatize the message here
            context.update({"message": message_option})

        msg = MessageBuilder(
            subject="Sentry Integration Request from %s" % requester.name,
            template="sentry/emails/requests/organization-integration.txt",
            html_template="sentry/emails/requests/organization-integration.html",
            type="organization.integration.request",
            context=context,
        )

        # TODO 1.1 What if there are multiple owners? What if there are no owners?
        msg.send_async([organization.get_default_owner().email])

        return Response(status=201)
