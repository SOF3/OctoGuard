import * as mysql from "mysql"
import {secrets} from "../secrets"
import {Object_size} from "../utils/helper";

const pool = mysql.createPool({
	connectionLimit: secrets.mysql.poolSize,
	host: secrets.mysql.host,
	user: secrets.mysql.username,
	password: secrets.mysql.password,
	database: secrets.mysql.schema,
	port: secrets.mysql.port

});

export interface SqlError extends Error{
	code: string;
	fatal: boolean;
	sql: string;
	sqlMessage: string;
}

type QueryArgument = string | number | boolean | Date | Buffer | null;
type CellValue = number | Date | Buffer | string;

export type ResultSet = StringMapping<CellValue>[];

export function reportError(err: SqlError){
		console.error(`Error ${err.code} executing query: ${err.sqlMessage}`);
	console.error(`Error at: '${err.sql}'`);
}

class Join{
	type: string = "";
	table: TableRef;
	on: string;

	toString(): string{
		return `${this.type} JOIN \`${this.table}\` ON ${this.on}`
	}

	static INNER_ON(factorTable: TableRef, factorColumn: string, refTable: TableRef, refColumn: string): Join{
		return Join.INNER(factorTable, `\`${factorTable}\`.\`${factorColumn}\` = \`${refTable}\`.\`${refColumn}\``);
	}

	static INNER(table: TableRef, on: string): Join{
		return new Join("INNER", table, on);
	}

	static LEFT_ON(factorTable: TableRef, factorColumn: string, refTable: TableRef, refColumn: string): Join{
		return Join.LEFT(factorTable, `\`${factorTable}\`.\`${factorColumn}\` = \`${refTable}\`.\`${refColumn}\``);
	}

	static LEFT(table: TableRef, on: string): Join{
		return new Join("LEFT", table, on);
	}

	static INNER_RIGHT(factorTable: TableRef, factorColumn: string, refTable: TableRef, refColumn: string): Join{
		return Join.RIGHT(factorTable, `\`${factorTable}\`.\`${factorColumn}\` = \`${refTable}\`.\`${refColumn}\``);
	}

	static RIGHT(table: TableRef, on: string): Join{
		return new Join("RIGHT", table, on);
	}

	static OUTER_ON(factorTable: TableRef, factorColumn: string, refTable: TableRef, refColumn: string): Join{
		return Join.OUTER(factorTable, `\`${factorTable}\`.\`${factorColumn}\` = \`${refTable}\`.\`${refColumn}\``);
	}

	static OUTER(table: TableRef, on: string): Join{
		return new Join("OUTER", table, on);
	}

	private constructor(type: string, table: TableRef, on: string){
		this.type = type;
		this.table = table;
		this.on = on;
	}
}

type TableRef = string;

class SelectQuery{
	from: TableRef;
	fields: StringMapping<string>;
	fieldArgs: QueryArgument[] = [];
	joins: Join[] = [];
	joinArgs: QueryArgument[] = [];
	where: string;
	whereArgs: QueryArgument[] = [];
	group: TableRef;

	createQuery(): string{
		let select_expr: string[] = [];
		for(const key in this.fields){
			select_expr.push(`${this.fields[key]} AS \`${key}\``);
		}
		return `SELECT ${select_expr.join(",")} FROM \`${this.from}\`
			${this.joins.map(join => join.toString()).join(" ")}`;
	}

	execute(onSelect: (result: ResultSet) => void, onError: (error: SqlError) => void){
		select(this.createQuery(), this.fieldArgs.concat(this.joinArgs).concat(this.whereArgs), onSelect, onError);
	}
}

function nop(): void{
}

export function select(query: string, args: QueryArgument[], onSelect: (result: ResultSet) => void, onError: (error: SqlError) => void){
	pool.query({
		sql: query,
		timeout: secrets.mysql.timeout,
		values: args
	}, (err, results, fields) =>{
		if(err){
			onError(err);
		}else{
			onSelect(results);
		}
	});
}

export function keyInsert(table: TableRef, staticFields: StringMapping<QueryArgument | null>, updateFields: StringMapping<QueryArgument | null>, onError: (error: SqlError) => void, onInsert: (insertId: number) => void = nop){
	const mergedFields: StringMapping<QueryArgument | null> = Object.assign({}, staticFields, updateFields);
	insert(`INSERT INTO \`${table}\`
		(${Object.keys(mergedFields).map(col => "`" + col + "`").join(",")})
		VALUES (${new Array(Object_size(mergedFields)).fill("?").join(",")})
		ON DUPLICATE KEY UPDATE ${Object.keys(updateFields).map(col => `\`${col}\` = ?`).join(",")}`,
		Object.values(mergedFields).concat(Object.values(updateFields)), onError, onInsert);
}

export function insert(query: string, args: QueryArgument[], onError: (error: SqlError) => void, onInsert: (insertId: number) => void){
	console.debug("MySQL query: " + query);
	pool.query({
		sql: query,
		timeout: secrets.mysql.timeout,
		values: args
	}, (err, results) =>{
		if(err){
			onError(err);
		}else{
			onInsert(results.insertId);
		}
	});
}

export function update(table: TableRef, set: StringMapping<QueryArgument | null>, where: string, whereArgs: QueryArgument[] = [], onError: (err: SqlError) => void, onUpdated: (affectedRows)=>void = nop){
	pool.query({
		sql: `UPDATE \`${table}\`
			SET ${Object.keys(set).map(column => `\`${column}\` = ?`).join(",")}
			WHERE ${where}`,
		values: Object.values(set).concat(whereArgs),
		timeout: secrets.mysql.timeout
	}, (err, results, fields) =>{
		if(err){
			onError(err);
		}else{
			onUpdated(results.affectedRows);
		}
	});
}

export function acquire(user: (err, connection) => void){
	pool.getConnection(user);
}
