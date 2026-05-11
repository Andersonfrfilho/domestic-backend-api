# Cleanup de Usuário de Teste

Script SQL para remover completamente um usuário do banco durante testes manuais.  
Deleta todos os registros relacionados na ordem correta respeitando as foreign keys.

## Como usar

1. Abra um cliente SQL conectado ao banco (`psql`, DBeaver, TablePlus, etc.)
2. Edite o valor de `v_email` na linha indicada
3. Execute o bloco inteiro

## Cobertura

| Tabela | Critério de remoção |
|---|---|
| `verification_codes` | `destination` = email ou phone do usuário |
| `terms_acceptances` | `user_id` |
| `user_documents` | `user_id` |
| `user_addresses` + `addresses` | `user_id` (remove endereços órfãos) |
| `user_phones` + `phones` | `user_id` |
| `user_emails` + `emails` | `user_id` |
| `company_members` | `user_id` |
| `companies` | empresas que ficaram sem membros |
| `users` | `id` |

## Query

```sql
DO $$
DECLARE
  v_email   TEXT := 'teste@exemplo.com';  -- <- altere aqui
  v_user_id UUID;
  v_email_id UUID;
  v_phone_id UUID;
BEGIN

  -- Resolve IDs a partir do email
  SELECT ue.user_id, ue.email_id
    INTO v_user_id, v_email_id
    FROM user_emails ue
    JOIN emails e ON e.id = ue.email_id
   WHERE e.email = v_email
   LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuário não encontrado para o email: %', v_email;
    RETURN;
  END IF;

  RAISE NOTICE 'Removendo usuário % (id: %)', v_email, v_user_id;

  -- 1. verification_codes (destination = email ou phone do usuário)
  DELETE FROM verification_codes
   WHERE destination = v_email
      OR destination IN (
        SELECT p.number FROM phones p
        JOIN user_phones up ON up.phone_id = p.id
        WHERE up.user_id = v_user_id
      );

  -- 2. terms_acceptances
  DELETE FROM terms_acceptances WHERE user_id = v_user_id;

  -- 3. user_documents
  DELETE FROM user_documents WHERE user_id = v_user_id;

  -- 4. user_addresses + endereços órfãos
  DELETE FROM addresses
   WHERE id IN (
     SELECT address_id FROM user_addresses WHERE user_id = v_user_id
   );
  DELETE FROM user_addresses WHERE user_id = v_user_id;

  -- 5. user_phones + phone órfão
  SELECT phone_id INTO v_phone_id
    FROM user_phones WHERE user_id = v_user_id LIMIT 1;

  DELETE FROM user_phones WHERE user_id = v_user_id;
  DELETE FROM phones WHERE id = v_phone_id;

  -- 6. user_emails + email órfão
  DELETE FROM user_emails WHERE user_id = v_user_id;
  DELETE FROM emails WHERE id = v_email_id;

  -- 7. company_members e empresas sem membros restantes
  DELETE FROM company_members WHERE user_id = v_user_id;
  DELETE FROM companies
   WHERE id NOT IN (SELECT DISTINCT company_id FROM company_members);

  -- 8. Usuário local
  DELETE FROM users WHERE id = v_user_id;

  RAISE NOTICE 'Usuário removido com sucesso.';
END;
$$;
```

## Keycloak

O script remove apenas o usuário do banco local. Para remover também do Keycloak, execute via Admin API ou pela interface em `/admin/master/console/#/domestic/users`.
