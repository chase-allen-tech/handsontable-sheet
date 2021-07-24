import { CONST_FALSE } from "./config"

export const STRUCT_WS = {
    id: null,
    name: null,
    tables: [],
    published_at: null,
    created_at: null,
    updated_by: null
}

export const STRUCT_TABLE_CELL = (ident, value, relation, date, created_by, updated_by) => {
    return {
        ident: ident,
        value: value,
        relation: relation,
        published_at: date,
        created_by: created_by,
        updated_by: updated_by
    }
}

export const STRUCT_TABLE_HEADER = (_id, name, type, target_col_uuid=null, target_col_name=null, target_table_id=null) => {
    return {
        _id: _id,
        name: name,
        type: type,
        target_table_id: target_table_id,
        target_col_uuid: target_col_uuid,
        target_col_name: target_col_name,
    }
}

export const STRUCT_TABLE = {
    id: null,
    name: null,
    workspace: null,
    headers: [],
    unique_id: null,
    rows: [],
    author: null,
    assignees: [],
    published_at: null,
    updated_at: null,
    created_by: null,
    updated_by: null
}

export const STRUCT_USER = {
    id: null,
    username: null,
    email: null,
    password: null,
    provider: 'local',
    confirmed: CONST_FALSE,
    blocked: CONST_FALSE,
    superadmin: CONST_FALSE,
    created_at: null,
    updated_at: null,
    role: 1,
    tables: []
}

export const STRUCT_FILE = (file) => {
    return {
        lastModified: file.lastModified,
        lastModifiedDate: file.lastModifiedDate,
        name: file.name,
        size: file.size,
        type: file.type,
    }
}