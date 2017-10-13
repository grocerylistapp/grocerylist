import {Profile} from '../profile/profile';

export interface Notification{
    user: Profile;
    buddy: Profile;
    status: string;
}
