import { SafeUser } from '../modules/users/users.model.js';
import { ISession } from '../modules/auth/session.model.js';
import { IStore } from '../modules/stores/stores.model.js';
import { IStoreMembership } from '../modules/memberships/memberships.model.js';

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      session?: ISession;
      store?: IStore;
      membership?: IStoreMembership;
      storeId?: string;
      requestId?: string;
    }
  }
}
export {};
