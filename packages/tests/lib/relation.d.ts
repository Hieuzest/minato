import { Database } from 'minato';
interface User {
    id: number;
    value?: number;
    profile?: Profile;
    posts?: Post[];
    successor?: Record<string, any> & {
        id: number;
    };
    predecessor?: Record<string, any> & {
        id: number;
    };
}
interface Profile {
    id: number;
    name?: string;
    user?: User;
}
interface Post {
    id2: number;
    score?: number;
    author?: User;
    content?: string;
    tags?: Tag[];
    _tags?: Post2Tag[];
}
interface Tag {
    id: number;
    name: string;
    posts?: Post[];
    _posts?: Post2Tag[];
}
interface Post2Tag {
    post?: Post & {
        id: number;
    };
    tag?: Tag & {
        id: number;
    };
}
interface Login {
    id: string;
    platform: string;
    name?: string;
    guilds?: Guild[];
    syncs?: GuildSync[];
}
interface Guild {
    id: string;
    platform2: string;
    name?: string;
    logins?: Login[];
    members?: Member[];
    syncs?: GuildSync[];
}
interface Member {
    guild: Guild;
    user: Login;
    name: string;
}
interface GuildSync {
    platform: string;
    syncAt?: number;
    guild?: Guild;
    login?: Login;
}
declare module 'minato' {
    interface Tables {
        user: User;
        profile: Profile;
        post: Post;
        tag: Tag;
        post2tag: Post2Tag;
        guildSync: GuildSync;
        login: Login;
        guild: Guild;
        member: Member;
    }
}
declare function RelationTests(database: Database): void;
declare namespace RelationTests {
    interface RelationOptions {
        nullableComparator?: boolean;
    }
    function select(database: Database, options?: RelationOptions): void;
    function query(database: Database): void;
    function create(database: Database, options?: RelationOptions): void;
    function modify(database: Database, options?: RelationOptions): void;
}
export default RelationTests;
