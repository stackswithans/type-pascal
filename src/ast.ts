import { Token, TT } from "./token";

export enum NodeKind {
    Program,
    Block,
    VarDecl,
    Type,
    ArrayRange,
    SubRoutine,
    Call,
    Assign,
    IOStmt,
    Variable,
    BinOp,
    UnaryOp,
    Literal,
}

export type NodeData =
    | Program
    | Block
    | VarDecl
    | SubRoutine
    | ArrayRange
    | Statement
    | Type
    | Expression;

export interface Node<T extends NodeData> {
    nodeKind: NodeKind;
    line: number;
    col: number;
    data: T;
}

export interface Program {
    id: Token;
    block: Block;
}

export interface Block {
    declarations: Array<Node<VarDecl> | Node<SubRoutine>>;
    statements: Node<Statement>[];
}

export type ArrayRange = { start: Token; end: Token };

export interface Type {
    typeTok: Token;
    isArray: boolean;
    range?: Node<ArrayRange>;
}

export interface VarDecl {
    id: Token;
    varType: Node<Type>;
}

export enum RoutineType {
    FUNCTION = "Function",
    PROCEDURE = "Procedure",
}

export interface SubRoutine {
    routineType: RoutineType;
    name: Token;
    formal_params: Node<VarDecl>[];
    block: Block;
    returnType: Node<Type> | null;
}

export interface Variable {
    id: Token;
    index?: Node<Expression>;
}

export interface IOStmt {
    ioStmt: Token;
    args: Node<Variable>[];
}

export interface Assign {
    target: Node<Variable>;
    expr: Node<Expression>;
}

export interface Call {
    callee: Node<Variable>;
    args: Node<Expression>[];
}

export type Statement = Variable | IOStmt | Assign | Call;

export type Expression = BinOp | UnaryOp | Variable | Call | Literal;

export interface BinOp {
    lhs: Node<Expression>;
    rhs: Node<Expression>;
    op: Token;
}

export interface UnaryOp {
    op: Token;
    operand: Node<Expression>;
}

export interface Literal {
    tokType: TT;
    value: string;
}

export function inspect<T extends NodeData>(node: Node<T>) {
    const stringifyType = (typeNode: Node<Type>) =>
        typeNode.data.isArray ? "[]" : "";

    const inspectBlock = (block: Block) => {
        let { declarations, statements } = block;
        for (let decl of declarations) {
            if (decl.nodeKind === NodeKind.VarDecl) {
                inspect(decl as Node<VarDecl>);
            } else {
                inspect(decl as Node<SubRoutine>);
            }
        }
        for (let stmt of statements) {
            inspect(stmt);
        }
    };

    switch (node.nodeKind) {
        case NodeKind.Program: {
            let { id, block } = node.data as Program;
            console.log("Program: " + id.lexeme + "\n");
            inspectBlock(block);
            break;
        }
        case NodeKind.Block: {
            let { declarations, statements } = node.data as Block;
            for (let decl of declarations) {
                if (decl.nodeKind === NodeKind.VarDecl) {
                    inspect(decl as Node<VarDecl>);
                } else {
                    inspect(decl as Node<SubRoutine>);
                }
            }
            for (let stmt of statements) {
                inspect(stmt);
            }
            break;
        }
        case NodeKind.VarDecl: {
            let { id, varType } = node.data as VarDecl;
            console.log(`Variable Declaration: 
                identifier: ${id.lexeme}
                type: ${varType.data.typeTok.lexeme} ${stringifyType(varType)}
            `);
            break;
        }
        case NodeKind.SubRoutine: {
            let {
                returnType,
                routineType,
                name,
                formal_params,
            } = node.data as SubRoutine;
            let returns: string =
                routineType === RoutineType.FUNCTION
                    ? stringifyType(returnType as Node<Type>)
                    : "";

            console.log(`${routineType}:
                        Nome: ${name.lexeme}
                        Parâmetros: ${formal_params.length}
                        Retorna: ${returns}
                        `);
            break;
        }
        case NodeKind.IOStmt: {
            let ioData = node.data as IOStmt;
            let message = `Statement:
            ${ioData.ioStmt.token}`;
            console.log(message);
            break;
        }
        case NodeKind.Assign: {
            let { target } = node.data as Assign;
            let message = `Statement:
            ${target.data.id.lexeme}`;
            console.log(message);
            break;
        }
        case NodeKind.Call: {
            let { callee } = node.data as Call;
            let message = `Statement:
            ${callee.data.id.lexeme}`;
            console.log(message);
            break;
        }
    }
}