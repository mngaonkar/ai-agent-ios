#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function required(name, value) {
  if (!value) {
    console.error(`Missing required value: ${name}`);
    process.exit(1);
  }
  return value;
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  if (idx >= 0 && args[idx + 1]) {
    return args[idx + 1];
  }
  return undefined;
};

const entityId = required('entity-id', getArg('entity-id') || process.env.SAML_ENTITY_ID);
const ssoUrl = required('sso-url', getArg('sso-url') || process.env.SAML_SSO_URL);
const cert = required('cert', getArg('cert') || process.env.SAML_CERT);

const nameIdFormat =
  getArg('nameid-format') ||
  process.env.SAML_NAMEID_FORMAT ||
  'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress';

const wantAuthnSigned =
  (getArg('want-authn-signed') || process.env.SAML_WANT_AUTHN_SIGNED || 'false').toLowerCase() === 'true';

const normalizedCert = cert
  .replace(/-----BEGIN CERTIFICATE-----/g, '')
  .replace(/-----END CERTIFICATE-----/g, '')
  .replace(/\s+/g, '')
  .trim();

const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${xmlEscape(entityId)}">
  <IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol" WantAuthnRequestsSigned="${wantAuthnSigned ? 'true' : 'false'}">
    <KeyDescriptor use="signing">
      <KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#">
        <X509Data>
          <X509Certificate>${xmlEscape(normalizedCert)}</X509Certificate>
        </X509Data>
      </KeyInfo>
    </KeyDescriptor>
    <NameIDFormat>${xmlEscape(nameIdFormat)}</NameIDFormat>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="${xmlEscape(ssoUrl)}" />
  </IDPSSODescriptor>
</EntityDescriptor>
`;

const output = getArg('out') || process.env.SAML_METADATA_OUT || 'entra-saml-metadata.xml';
const outputPath = path.resolve(process.cwd(), output);
fs.writeFileSync(outputPath, metadata, 'utf8');

console.log(`SAML metadata written to ${outputPath}`);
