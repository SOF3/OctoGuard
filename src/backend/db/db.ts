import * as mysql from "mysql"
import {secrets} from "../secrets"

const pool = mysql.createPool({
	connectionLimit: secrets.mysql.poolSize,
	host: secrets.mysql.host,
	user: secrets.mysql.username,
	password: secrets.mysql.password,
	database: secrets.mysql.schema,
	port: secrets.mysql.port

});

type QueryArgument = string | number | boolean | null;

export interface SqlError extends Error{
	code: string;
	fatal: boolean;
	sql: string;
	sqlMessage: string;
}

export type ResultSet = StringMapping<number | Date | Buffer | string>[];

function handleError(query: string): (error: SqlError) => void{
	return err =>{
		console.error(`Error ${err.code} executing query: ${err.sqlMessage}`);
		console.error(`Full query: ${query}`);
		console.error(`Error section: ${err.sql}`);
	}
}

export function select(query: string, args: QueryArgument[] = [], onSelect: (result: ResultSet) => void = () =>{
}, onError: (error: SqlError) => void = handleError(query)){
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

export function insert(query: string, args: QueryArgument[] = [], onInsert: (insertId: number) => void = () =>{
}, onError: (error: SqlError) => void = handleError(query)){
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

interface ConnectionUser{
	(err, connection);
}

export function acquire(user: ConnectionUser){
	pool.getConnection(user);
}
