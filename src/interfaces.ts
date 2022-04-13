export interface AuditLogMessage {
  actor: {
    type: string;
    id: string;
  };
  service: {
    type: string;
    id: string;
  };
  action: {
    type: string;
    verb: string;
  };
  object: {
    type: string;
    id: string;
  };
  pii: string[];
  outcome: string;
  timestamp: string;
}

export enum ActionVerb {
  CREATED = 'created',
  DELETED = 'deleted',
  MODIFIED = 'modified',
  ACCESSED = 'accessed',
}

export enum Outcome {
  SUCCESS = 'success',
  FAILURE = 'failure',
  UNKNOWN = 'unknown',
}

export enum ActorType {
  IP = 'urn:forlagshuset:identity:ip',
  Eportal = 'urn:forlagshuset:identity:eportal',
  AzureAd = 'urn:forlagshuset:identity:azuread',
  Facebook = 'urn:forlagshuset:identity:facebook',
  Feide = 'urn:forlagshuset:identity:feide',
  Portfolio = 'urn:forlagshuset:identity:portfolio',
  Dpm = 'urn:forlagshuset:identity:dpm',
  Fingerprint = 'urn:forlagshuset:identity:fingerprint',
  Local = 'urn:forlagshuset:identity:local',
}

export enum ServiceType {
  App = 'urn:forlagshuset:service:app',
  Batch = 'urn:forlagshuset:service:batch',
}

export enum ActionType {
  IamAuthentication = 'urn:forlagshuset:action:iam:authentication',
  IamAuthenticationCallback = 'urn:forlagshuset:action:iam:authentication:callback',
  IamAuthorization = 'urn:forlagshuset:action:iam:authorization',
  IamImpersonation = 'urn:forlagshuset:action:iam:impersonation',
  IamCredential = 'urn:forlagshuset:action:iam:credential',
  IamCredentialRecovery = 'urn:forlagshuset:action:iam:credential:recovery',
  IamUser = 'urn:forlagshuset:action:iam:user',
  IamInstitution = 'urn:forlagshuset:action:iam:institution',
  IamRole = 'urn:forlagshuset:action:iam:role',
  Object = 'urn:forlagshuset:action:object',
}

export enum ObjectType {
  EportalUser = 'urn:forlagshuset:object:eportal:user',
  AzureadUser = 'urn:forlagshuset:object:azuread:user',
  FacebookUser = 'urn:forlagshuset:object:facebook:user',
  FeideUser = 'urn:forlagshuset:object:feide:user',
  PortfolioUser = 'urn:forlagshuset:object:portfolio:user',
  ErudioNamespace = 'urn:forlagshuset:object:erudio:namespace',
  ErudioStructure = 'urn:forlagshuset:object:erudio:structure',
  ErudioContent = 'urn:forlagshuset:object:erudio:content',
  ErudioAsset = 'urn:forlagshuset:object:erudio:asset',
  ErudioUserAsset = 'urn:forlagshuset:object:erudio:user-asset',
  EportalGroup = 'urn:forlagshuset:object:eportal:group',
  DbokBook = 'urn:forlagshuset:object:dbok:book',
  DpmBook = 'urn:forlagshuset:object:dpm:book',
  DpmUser = 'urn:forlagshuset:object:dpm:user',
  ePortalProduct = 'urn:forlagshuset:object:eportal:product',
  PortfolioCourse = 'urn:forlagshuset:object:portfolio:course',
  PortfolioGroup = 'urn:forlagshuset:object:portfolio:group',
}

export enum PII {
  Password = 'urn:forlagshuset:pii:password',
  Role = 'urn:forlagshuset:pii:role',
  Email = 'urn:forlagshuset:pii:email',
  LegalName = 'urn:forlagshuset:pii:legal-name',
  Username = 'urn:forlagshuset:pii:username',
  GroupMembership = 'urn:forlagshuset:pii:group-membership',
  ProductOwnership = 'urn:forlagshuset:pii:product-ownership',
  NationalId = 'urn:forlagshuset:pii:national-id',
  InstitutionMembership = 'urn:forlagshuset:pii:institution-membership',
  PhoneNumber = 'urn:forlagshuset:pii:phone-number',
  PublicKey = 'urn:forlagshuset:pii:public-key',
  MfaToken = 'urn:forlagshuset:pii:mfa-token',
}

export interface AuditLogOptions {
  actorType: ActorType;
  actionType: ActionType;
  objectType: ObjectType;
  service: {
    type: ServiceType;
    id: string;
  };
}

export interface AuditLogParams {
  actorId: string;
  actionVerb: ActionVerb;
  objectId: string;
  outcome: Outcome;
  pii: PII[];
}
