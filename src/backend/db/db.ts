import * as mysql from "mysql"
import {secrets} from "../secrets"
import {Object_size} from "../utils/helper"

const pool = mysql.createPool({
	connectionLimit: secrets.mysql.poolSize,
	host: secrets.mysql.host,
	user: secrets.mysql.username,
	password: secrets.mysql.password,
	database: secrets.mysql.schema,
	port: secrets.mysql.port

})

export interface SqlError extends Error{
	code: string
	fatal: boolean
	sql: string
	sqlMessage: string
}

export function reportError(err: SqlError){
	console.error(`Error ${err.code} executing query: ${err.sqlMessage}`)
	console.error(`Error at: '${err.sql}'`)
}

export class Join{
	type: string = ""
	table: TableRef
	on: string

	toString(): string{
		return `${this.type} JOIN \`${this.table}\` ON ${this.on}`
	}

	static INNER_ON(motherTable: TableRef, motherColumn: string, satelliteTable: TableRef, satelliteColumn: string): Join{
		return Join.INNER(motherTable, `\`${motherTable}\`.\`${motherColumn}\` = \`${satelliteTable}\`.\`${satelliteColumn}\``)
	}

	static INNER(table: TableRef, on: string): Join{
		return new Join("INNER", table, on)
	}

	static LEFT_ON(motherTable: TableRef, motherColumn: string, satelliteTable: TableRef, satelliteColumn: string): Join{
		return Join.LEFT(motherTable, `\`${motherTable}\`.\`${motherColumn}\` = \`${satelliteTable}\`.\`${satelliteColumn}\``)
	}

	static LEFT(table: TableRef, on: string): Join{
		return new Join("LEFT", table, on)
	}

	static INNER_RIGHT(motherTable: TableRef, motherColumn: string, satelliteTable: TableRef, satelliteColumn: string): Join{
		return Join.RIGHT(motherTable, `\`${motherTable}\`.\`${motherColumn}\` = \`${satelliteTable}\`.\`${satelliteColumn}\``)
	}

	static RIGHT(table: TableRef, on: string): Join{
		return new Join("RIGHT", table, on)
	}

	static OUTER_ON(motherTable: TableRef, motherColumn: string, satelliteTable: TableRef, satelliteColumn: string): Join{
		return Join.OUTER(motherTable, `\`${motherTable}\`.\`${motherColumn}\` = \`${satelliteTable}\`.\`${satelliteColumn}\``)
	}

	static OUTER(table: TableRef, on: string): Join{
		return new Join("OUTER", table, on)
	}

	private constructor(type: string, table: TableRef, on: string){
		this.type = type
		this.table = table
		this.on = on
	}
}

export type QueryArgument = string | number | boolean | Date | Buffer | null
export type ResultSet<R extends StringMapping<CellValue>> = R[]
export type TableRef = string
type WhereClause = string | IWhereClause
type WhereArgs = QueryArgument[] | IWhereClause
export type FieldRef = string | {toString(): string}
export type FieldList = StringMapping<FieldRef>

function nop(): void{
}

interface IWhereClause{
	toString(): string

	getArgs(): QueryArgument[]
}

export class ListWhereClause implements IWhereClause{
	field: FieldRef
	literalList: QueryArgument[]

	constructor(field: FieldRef, literalList: QueryArgument[]){
		this.field = field
		this.literalList = literalList
	}

	toString(): string{
		return `${this.field} IN (${qm(this.literalList.length)})`
	}

	getArgs(): QueryArgument[]{
		return this.literalList
	}
}

export interface DbErrorHandler{
	(error: SqlError): void
}

export class SelectQuery{
	fields: FieldList
	fieldArgs: QueryArgument[] = []
	from: TableRef
	joins: Join[] = []
	joinArgs: QueryArgument[] = []
	where: TypeOrArray<WhereClause>
	whereArgs: TypeOrArray<WhereArgs> = []
	group?: TableRef
	having?: WhereClause
	havingArgs: WhereArgs = []
	order?: FieldRef
	orderDesc: boolean = false
	orderArgs: QueryArgument[] = []
	limit?: number

	createQuery(): string{
		let select_expr: string[] = []
		for(const key in this.fields){
			select_expr.push(`${this.fields[key]} AS \`${key}\``)
		}
		return `SELECT ${select_expr.join(",")} FROM \`${this.from}\`
			${this.joins.map(join => join.toString()).join(" ")}
			WHERE ${this.where instanceof Array ? this.where.map(c => c.toString()).join(" ") : this.where}
			${this.group ? `GROUP BY ${this.group}` : ""}
			${this.having ? `HAVING ${this.having}` : ""}
			${this.order ? `ORDER BY ${this.order} ${this.orderDesc ? "DESC" : "ASC"}` : ""}
			${this.limit ? `LIMIT ${this.limit}` : ""}`
	}

	createArgs(): QueryArgument[]{
		if(!(this.whereArgs instanceof Array)){
			return this.whereArgs.getArgs()
		}
		let whereArgs = []
		for(const i in this.whereArgs){
			const arg: QueryArgument[] | QueryArgument | IWhereClause = this.whereArgs[i]
			if(arg instanceof Array){
				whereArgs = whereArgs.concat(arg)
			}else if(typeof arg === "object" && !(arg instanceof Date) && !(arg instanceof Buffer)){
				whereArgs = whereArgs.concat(arg.getArgs())
			}else{
				whereArgs.push(arg)
			}
		}
		return this.fieldArgs
			.concat(this.joinArgs)
			.concat(whereArgs)
			.concat(this.havingArgs instanceof Array ? this.havingArgs : this.havingArgs.getArgs())
			.concat(this.orderArgs)
	}

	execute<R extends StringMapping<CellValue>>(onSelect: (result: ResultSet<R>) => void, onError: DbErrorHandler){
		select(this.createQuery(),
			this.createArgs(),
			onSelect,
			onError)
	}
}

export function qm(count: number){
	return new Array(count).fill("?").join(",")
}

export function select<R extends StringMapping<CellValue>>(query: string, args: QueryArgument[], onSelect: (result: ResultSet<R>) => void, onError: DbErrorHandler){
	console.debug("Executing query: ", query)
	console.debug("Args:", args)
	pool.query({
		sql: query,
		timeout: secrets.mysql.timeout,
		values: args
	}, (err: SqlError, results, fields) =>{
		if(err){
			onError(err)
		}else{
			onSelect(results)
		}
	})
}

export function keyInsert(table: TableRef, staticFields: StringMapping<QueryArgument | null>, updateFields: StringMapping<QueryArgument | null>, onError: DbErrorHandler, onInsert: (insertId: number) => void = nop){
	const mergedFields: StringMapping<QueryArgument | null> = Object.assign({}, staticFields, updateFields)
	insert(`INSERT INTO \`${table}\`
		(${Object.keys(mergedFields).map(col => "`" + col + "`").join(",")})
		VALUES (${qm(Object_size(mergedFields))})
		ON DUPLICATE KEY UPDATE ${Object.keys(updateFields).map(col => `\`${col}\` = ?`).join(",")}`,
		Object.values(mergedFields).concat(Object.values(updateFields)), onError, onInsert)
}

export function insert(query: string, args: QueryArgument[], onError: DbErrorHandler, onInsert: (insertId: number) => void){
	console.debug("MySQL query: " + query)
	pool.query({
		sql: query,
		timeout: secrets.mysql.timeout,
		values: args
	}, (err: SqlError, results) =>{
		if(err){
			onError(err)
		}else{
			onInsert(results.insertId)
		}
	})
}

export function update(table: TableRef, set: StringMapping<QueryArgument | null>, where: WhereClause, whereArgs: QueryArgument[] = [], onError: DbErrorHandler, onUpdated: (changedRows) => void = nop){
	pool.query({
		sql: `UPDATE \`${table}\`
			SET ${Object.keys(set).map(column => `\`${column}\` = ?`).join(",")}
			WHERE ${where}`,
		values: Object.values(set).concat(whereArgs),
		timeout: secrets.mysql.timeout
	}, (err, results, fields) =>{
		if(err){
			onError(err)
		}else{
			onUpdated(results.changedRows)
		}
	})
}

export function acquire(user: (err, connection) => void){
	pool.getConnection(user)
}
