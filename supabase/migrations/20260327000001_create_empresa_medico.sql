-- Migration: create empresa_medico table
-- App: painel-medico
-- Date: 2026-03-27
-- Description: Fiscal company data for NFS-e emission per doctor via Nuvem Fiscal.

CREATE TABLE IF NOT EXISTS empresa_medico (
    id                           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    medico_id                    uuid NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,

    -- Identificação
    cnpj                         text NOT NULL,
    razao_social                 text NOT NULL,
    nome_fantasia                text,
    inscricao_municipal          text,
    inscricao_estadual           text,

    -- Regime fiscal
    -- 1=Simples Nacional, 2=Simples Nacional excesso, 3=Regime Normal, 4=MEI
    regime_tributario            smallint NOT NULL DEFAULT 1,

    -- Endereço fiscal
    endereco_fiscal_cep          text,
    endereco_fiscal_logradouro   text,
    endereco_fiscal_numero       text,
    endereco_fiscal_complemento  text,
    endereco_fiscal_bairro       text,
    endereco_fiscal_cidade       text,
    endereco_fiscal_uf           char(2),
    endereco_fiscal_ibge         text,

    -- Nuvem Fiscal
    nuvem_fiscal_empresa_id      text,
    nuvem_fiscal_sincronizado    boolean NOT NULL DEFAULT false,
    nuvem_fiscal_sincronizado_em timestamptz,

    created_at                   timestamptz NOT NULL DEFAULT now(),
    updated_at                   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS empresa_medico_medico_id_unique
    ON empresa_medico (medico_id);

ALTER TABLE empresa_medico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medico can select own empresa"
    ON empresa_medico FOR SELECT
    USING (auth.uid() = medico_id);

CREATE POLICY "medico can insert own empresa"
    ON empresa_medico FOR INSERT
    WITH CHECK (auth.uid() = medico_id);

CREATE POLICY "medico can update own empresa"
    ON empresa_medico FOR UPDATE
    USING (auth.uid() = medico_id)
    WITH CHECK (auth.uid() = medico_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_empresa_medico_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER empresa_medico_updated_at
    BEFORE UPDATE ON empresa_medico
    FOR EACH ROW EXECUTE FUNCTION update_empresa_medico_updated_at();

-- Add tipo column to certificados_digitais if it doesn't exist
-- Allows distinguishing e-CPF (doctor) from e-CNPJ (company)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'certificados_digitais' AND column_name = 'tipo'
    ) THEN
        ALTER TABLE certificados_digitais
            ADD COLUMN tipo text NOT NULL DEFAULT 'e-cpf'
            CHECK (tipo IN ('e-cpf', 'e-cnpj'));
    END IF;
END $$;

COMMENT ON TABLE empresa_medico IS 'Fiscal company data for NFS-e emission per doctor';
COMMENT ON COLUMN empresa_medico.regime_tributario IS '1=Simples Nacional 2=SN excesso 3=Regime Normal 4=MEI';
COMMENT ON COLUMN empresa_medico.endereco_fiscal_ibge IS 'IBGE city code required by Nuvem Fiscal API';
