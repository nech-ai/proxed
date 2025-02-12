export interface Node {
	type: string;
	start: number;
	end: number;
}

export interface Position {
	line: number;
	column: number;
}

export interface Identifier extends Node {
	type: "Identifier";
	name: string;
}
