interface CertificateData {
    commonName: string;
    cpf: string;
    serialNumber: string;
    issuer: string;
    validFrom: string;
    validTo: string;
}

interface ParseResult {
    dados_certificado: CertificateData;
    validTo: string;
}

export async function parsePfxCertificate(buffer: ArrayBuffer, password: string): Promise<ParseResult> {
    const forge = await import('node-forge').then(m => m.default);

    const pfxAsn1 = forge.asn1.fromDer(forge.util.createBuffer(new Uint8Array(buffer)));
    const p12 = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);
    const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const certBag = bags[forge.pki.oids.certBag]?.[0];
    if (!certBag?.cert) throw new Error('Certificado inválido');

    const cert = certBag.cert;
    const subject = cert.subject.attributes;
    const issuer = cert.issuer.attributes;
    const commonName = subject.find((a: any) => a.shortName === 'CN' || a.name === 'commonName')?.value || '';

    let cpf = '';
    const cpfAttr = subject.find((a: any) => a.type === '2.16.76.1.3.1');
    if (cpfAttr) cpf = Array.isArray(cpfAttr.value) ? cpfAttr.value[0] : cpfAttr.value;

    let cleanName = commonName;
    if (typeof commonName === 'string' && commonName.includes(':')) {
        const parts = commonName.split(':');
        const last = parts[parts.length - 1].trim();
        if (/^\d{11}$/.test(last)) {
            if (!cpf) cpf = last;
            parts.pop();
            cleanName = parts.join(':').trim();
        }
    }

    const validTo = cert.validity.notAfter.toISOString();

    return {
        validTo,
        dados_certificado: {
            commonName: cleanName,
            cpf: cpf || 'Não identificado',
            serialNumber: cert.serialNumber,
            issuer: issuer.find((a: any) => a.shortName === 'CN' || a.name === 'commonName')?.value || '',
            validFrom: cert.validity.notBefore.toISOString(),
            validTo,
        },
    };
}
