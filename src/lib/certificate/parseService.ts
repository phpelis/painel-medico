interface CertificateData {
    commonName: string;
    cpf?: string;
    cnpj?: string;
    tipo: 'e-cpf' | 'e-cnpj';
    serialNumber: string;
    issuer: string;
    validFrom: string;
    validTo: string;
}

interface ParseResult {
    dados_certificado: CertificateData;
    validTo: string;
    tipo: 'e-cpf' | 'e-cnpj';
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

    // Detecção de CPF (OID: 2.16.76.1.3.1)
    let cpf = '';
    const cpfAttr = subject.find((a: any) => a.type === '2.16.76.1.3.1');
    if (cpfAttr) cpf = Array.isArray(cpfAttr.value) ? cpfAttr.value[0] : cpfAttr.value;

    // Detecção de CNPJ (OID: 2.16.76.1.3.3)
    let cnpj = '';
    const cnpjAttr = subject.find((a: any) => a.type === '2.16.76.1.3.3');
    if (cnpjAttr) cnpj = Array.isArray(cnpjAttr.value) ? cnpjAttr.value[0] : cnpjAttr.value;

    let cleanName = commonName;
    if (typeof commonName === 'string' && commonName.includes(':')) {
        const parts = commonName.split(':');
        const last = parts[parts.length - 1].trim();
        
        // Limpa CPF (11 dígitos) ou CNPJ (14 dígitos) do commonName
        if (/^\d{11}$/.test(last) || /^\d{14}$/.test(last)) {
            if (/^\d{11}$/.test(last) && !cpf) cpf = last;
            if (/^\d{14}$/.test(last) && !cnpj) cnpj = last;
            parts.pop();
            cleanName = parts.join(':').trim();
        }
    }

    const tipo: 'e-cpf' | 'e-cnpj' = cnpj ? 'e-cnpj' : 'e-cpf';
    const validTo = cert.validity.notAfter.toISOString();

    return {
        validTo,
        tipo,
        dados_certificado: {
            commonName: String(cleanName),
            cpf: cpf || undefined,
            cnpj: cnpj || undefined,
            tipo,
            serialNumber: cert.serialNumber,
            issuer: String(issuer.find((a: any) => a.shortName === 'CN' || a.name === 'commonName')?.value || ''),
            validFrom: cert.validity.notBefore.toISOString(),
            validTo,
        },
    };
}
