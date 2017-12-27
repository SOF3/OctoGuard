import * as mysql from "mysql"
import {secrets} from "../secrets"
import {Object_size} from "../utils/helper"

export namespace db{
	const pool = mysql.createPool({
		connectionLimit: secrets.mysql.poolSize,
		host: secrets.mysql.host,
		user: secrets.mysql.username,
		password: secrets.mysql.password,
		database: secrets.mysql.schema,
		port: secrets.mysql.port,

	})

	export interface SqlError extends Error{
		code: string
		fatal: boolean
		sql: string
		sqlMessage: string
	}

	export const reportError: ErrorHandler = (err: SqlError) =>{
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
	export type ResultSet<R extends StringMap<CellValue>> = R[]
	export type TableRef = string
	export type WhereClause = string | IWhereClause
	export type WhereArgs = QueryArgument[] | IWhereClause
	export type FieldRef = string | {toString(): string}
	export type FieldList = StringMap<FieldRef>

	function nop(): void{
	}

	export interface IWhereClause{
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

	export interface ErrorHandler{
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
				if(this.fields.hasOwnProperty(key)){
					select_expr.push(`${this.fields[key]} AS \`${key}\``)
				}
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

		execute<R extends StringMap<CellValue>>(onSelect: (result: ResultSet<R>) => void, onError: ErrorHandler){
			select(this.createQuery(),
				this.createArgs(),
				onSelect,
				onError)
		}
	}

	export function qm(count: number){
		return new Array(count).fill("?").join(",")
	}

	export function select<R extends StringMap<CellValue>>(query: string, args: QueryArgument[], onSelect: (result: ResultSet<R>) => void, onError: ErrorHandler){
		console.debug("Executing query: ", query.trim())
		console.debug("Args:", args)
		pool.query({
			sql: query,
			timeout: secrets.mysql.timeout,
			values: args,
		}, (err: SqlError, results, fields) =>{
			if(err){
				onError(err)
			}else{
				onSelect(results)
			}
		})
	}

	export function insert_dup(table: TableRef, staticFields: StringMap<QueryArgument | null>, updateFields: StringMap<QueryArgument | null>, onError: ErrorHandler, onInsert: (insertId: number) => void = nop){
		const mergedFields: StringMap<QueryArgument | null> = Object.assign({}, staticFields, updateFields)
		insert(`INSERT INTO \`${table}\`
			(${Object.keys(mergedFields).map(col => "`" + col + "`").join(",")})
			VALUES (${qm(Object_size(mergedFields))})
			ON DUPLICATE KEY UPDATE ${Object.keys(updateFields).map(col => `\`${col}\` = ?`).join(",")}`,
			Object.values(mergedFields).concat(Object.values(updateFields)), onError, onInsert)
	}

	export function insert(query: string, args: QueryArgument[], onError: ErrorHandler, onInsert: (insertId: number) => void){
		console.debug("MySQL query: " + query)
		pool.query({
			sql: query,
			timeout: secrets.mysql.timeout,
			values: args,
		}, (err: SqlError, results) =>{
			if(err){
				onError(err)
			}else{
				onInsert(results.insertId)
			}
		})
	}

	export function update(table: TableRef, set: StringMap<QueryArgument | null>, where: WhereClause, whereArgs: WhereArgs, onError: ErrorHandler, onUpdated: (changedRows) => void = nop){
		const query = `UPDATE \`${table}\`
				SET ${Object.keys(set).map(column => `\`${column}\` = ?`).join(",")}
				WHERE ${where}`
		console.debug("MySQL query: " + query)
		pool.query({
			sql: query,
			values: Object.values(set).concat(whereArgs instanceof Array ? whereArgs : whereArgs.getArgs()),
			timeout: secrets.mysql.timeout,
		}, (err, results, fields) =>{
			if(err){
				onError(err)
			}else{
				onUpdated(results.changedRows)
			}
		})
	}

	export function del(table: TableRef, where: WhereClause, whereArgs: WhereArgs, onError: ErrorHandler){
		const query = `DELETE FROM \`${table}\` WHERE ${where}`
		console.debug("MySQL query: " + query)
		pool.query({
			sql: query,
			values: whereArgs instanceof Array ? whereArgs : whereArgs.getArgs(),
			timeout: secrets.mysql.timeout,
		}, (err: SqlError, results, fields) =>{
			if(err){
				onError(err)
			}
		})
	}

	export function acquire(user: (err, connection) => void){
		pool.getConnection(user)
	}
}
