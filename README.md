# Audit Logging

**WIP**

Currently it's a copy&paste from a service where this audit logging feature had been developed. It has to be cleaned up, fixed and tested.

Typical usecase:

```
const auditLog = new AuditLog({
  actorType: ActorType.IP;
  actionType: ActionType.Object;
  objectType: ObjectType.FacebookUser;
  service: {
    type: ServiceType.App;
    id: 'service.name';
  };
});
const auditLogger = new BaseAuditLogger("audit.subject", auditLog, console);
const req = /* any object actually that we can take data from */ {actor_id: 3, object_id: 4}
const params = {
  actorIdGetter: (req: any) => req.actor_id,
  objectIdGetter: (req: any) => req.object_id,
  action: ActionVerb.MODIFIED,
}
await auditLogger.log(params, req);
```
