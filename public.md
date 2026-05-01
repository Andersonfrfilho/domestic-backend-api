classDiagram
direction BT
class addresses {
   uuid id
   varchar street
   varchar number
   varchar neighborhood
   varchar city
   varchar state
   varchar zipcode
   varchar latitude
   varchar longitude
   boolean is_verified
   timestamp created_at
   varchar complement
}
class benchmark_nanoid {
   varchar(21) id
   varchar(255) name
   varchar(255) email
   integer age
   varchar(100) city
   jsonb data
   timestamp created_at
   timestamp updated_at
}
class benchmark_snowflake {
   bigint id
   varchar(255) name
   varchar(255) email
   integer age
   varchar(100) city
   jsonb data
   timestamp created_at
   timestamp updated_at
}
class benchmark_uuid_v4 {
   uuid id
   varchar(255) name
   varchar(255) email
   integer age
   varchar(100) city
   jsonb data
   timestamp created_at
   timestamp updated_at
}
class benchmark_uuid_v7 {
   uuid id
   varchar(255) name
   varchar(255) email
   integer age
   varchar(100) city
   jsonb data
   timestamp created_at
   timestamp updated_at
}
class categories {
   uuid id
   varchar name
   varchar slug
   varchar icon_url
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
   boolean is_active
}
class documents {
   uuid id
   uuid user_id
   varchar document_type
   varchar document_url
   varchar status
   timestamp verified_at
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
}
class emails {
   uuid id
   varchar email
   boolean is_verified
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
}
class migrations {
   integer id
   bigint timestamp
   varchar name
}
class phones {
   uuid id
   varchar number
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
   varchar type  /* MOBILE, LANDLINE, WHATSAPP */
   boolean is_verified
}
class provider_addresses {
   uuid id
   uuid provider_id
   uuid address_id
   varchar label
   boolean is_primary
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
}
class provider_documents {
   uuid id
   uuid provider_id
   varchar document_type  /* CPF, CNPJ, RG, LICENSE, etc */
   varchar document_url
   varchar status  /* PENDING, APPROVED, REJECTED */
   timestamp uploaded_at
   timestamp reviewed_at
   uuid reviewed_by
   text rejection_reason
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
}
class provider_emails {
   uuid id
   uuid provider_id
   uuid email_id
   varchar label
   boolean is_primary
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
}
class provider_phones {
   uuid id
   uuid provider_id
   uuid phone_id
   varchar label
   boolean is_primary
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
}
class provider_profiles {
   uuid id
   uuid user_id
   varchar business_name
   text description
   numeric average_rating
   boolean is_available
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
}
class provider_services {
   uuid id
   uuid provider_id
   uuid service_id
   numeric price_base
   varchar price_type
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
}
class provider_verification_logs {
   uuid id
   uuid verification_id
   varchar action  /* SUBMITTED, MOVED_TO_REVIEW, APPROVED, REJECTED */
   uuid performed_by  /* ID do usuário/admin */
   varchar previous_status
   varchar new_status
   text notes
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
}
class provider_verifications {
   uuid id
   uuid provider_id
   varchar status  /* PENDING, UNDER_REVIEW, APPROVED, REJECTED */
   timestamp submitted_at
   timestamp reviewed_at
   reviewed_by  /* ID do admin (Keycloak ou interno) */ uuid
   text notes
   timestamp updated_at
   timestamp deleted_at
}
class provider_work_locations {
   uuid id
   uuid provider_id
   uuid address_id
   varchar name
   boolean is_primary
   boolean is_active
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
}
class reviews {
   uuid id
   uuid service_request_id
   uuid contractor_id
   uuid provider_id
   integer rating
   text comment
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
}
class service_requests {
   uuid id
   uuid contractor_id
   uuid provider_id
   uuid service_id
   uuid address_id
   varchar status
   boolean contractor_confirmed
   boolean provider_confirmed
   text description
   timestamp scheduled_at
   numeric price_final
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
}
class services {
   uuid id
   uuid category_id
   varchar name
   text description
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
}
class terms_acceptances {
   uuid id
   uuid user_id
   uuid terms_version_id
   timestamp accepted_at
   varchar(45) ip_address
   timestamp created_at
}
class terms_versions {
   uuid id
   varchar(20) version
   varchar(255) title
   varchar(500) content_url
   boolean is_active
   timestamp effective_date
   timestamp created_at
}
class user_addresses {
   uuid id
   uuid user_id
   uuid address_id
   varchar label
   boolean is_primary
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
}
class user_emails {
   uuid id
   uuid user_id
   uuid email_id
   varchar label
   boolean is_primary
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
}
class user_phones {
   uuid id
   uuid user_id
   uuid phone_id
   varchar label
   boolean is_primary
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
}
class users {
   uuid id
   timestamp created_at
   timestamp updated_at
   timestamp deleted_at
   uuid keycloak_id
   varchar full_name
   varchar status
}
class verification_codes {
   uuid id
   varchar(255) destination
   varchar(10) type
   varchar(6) code
   timestamp expires_at
   timestamp verified_at
   boolean is_used
   timestamp created_at
}

documents  -->  users : user_id:id
provider_addresses  -->  addresses : address_id:id
provider_emails  -->  emails : email_id:id
provider_phones  -->  phones : phone_id:id
provider_profiles  -->  users : user_id:id
provider_services  -->  services : service_id:id
provider_work_locations  -->  addresses : address_id:id
reviews  -->  service_requests : service_request_id:id
service_requests  -->  addresses : address_id:id
service_requests  -->  services : service_id:id
services  -->  categories : category_id:id
terms_acceptances  -->  terms_versions : terms_version_id:id
terms_acceptances  -->  users : user_id:id
user_addresses  -->  addresses : address_id:id
user_addresses  -->  users : user_id:id
user_emails  -->  emails : email_id:id
user_emails  -->  users : user_id:id
user_phones  -->  phones : phone_id:id
user_phones  -->  users : user_id:id
