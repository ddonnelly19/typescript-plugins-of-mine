// kind & type helpers

import ts from 'typescript';
import { isDeclaration } from '.';
import { findChild } from './node';


/** get the kind name as string of given kind value or node */
export function getKindName(kind: number | ts.Node): string {
	return (kind || kind === 0) ? getEnumKey(ts.SyntaxKind, (kind as ts.Node).kind || kind) : 'undefined'
}

export function getEnumKey(anEnum: any, value: any): string {
	for (const key in anEnum) {
		if (value === anEnum[key]) {
			return key
		}
	}
	return ''
}

let syntaxKindMap: { [x: string]: number } | undefined = undefined

export function syntaxKindToMap(): { [x: string]: number } {
	if (!syntaxKindMap) {
		syntaxKindMap = {}
		for (var i in ts.SyntaxKind) {
			const parsed = parseInt(i)
			if (parsed || parsed === 0) {
				syntaxKindMap[ts.SyntaxKind[i]] = parsed
			}
		}
	}
	return syntaxKindMap
}


let typeFormatFlagsMap: { [x: string]: number } | undefined = undefined

export function typeFormatFlagsToMap(): { [x: string]: number } {
	if (!typeFormatFlagsMap) {
		typeFormatFlagsMap = {}
		for (var i in ts.TypeFormatFlags) {
			const parsed = parseInt(i)
			if (parsed || parsed === 0) {
				typeFormatFlagsMap[ts.TypeFormatFlags[i]] = parsed
			}
		}
	}
	return typeFormatFlagsMap
}

/**
 * Retrieves the string representation of the type for a given TypeScript node.
 *
 * @param node - The TypeScript node for which the type string is to be determined.
 * @param program - The TypeScript program containing the node.
 * @returns A string representing the type of the node, such as 'number' or 'string',
 *          or `undefined` if the type could not be determined.
 */
export function getTypeStringFor(node: ts.Node, program: ts.Program): string | undefined {
	const type = getTypeFor(node, program)
	if (!type) {
		return
	}
	if (type.isNumberLiteral()) {
		return 'number'
	}
	if (type.isStringLiteral()) {
		return 'string'
	}
	return program.getTypeChecker().typeToString(type, node, ts.TypeFormatFlags.None) || undefined
}

/**
 * because getTypeStringFor returns type strings not suitable for declarations, for example, for function like, returns "(args)=>Foo" where for declarations it should be (args):Foo
 */
export function getTypeStringForDeclarations(node: ts.Node, program: ts.Program): string {
	let newText = getTypeStringFor(node, program)
	if (ts.isFunctionLike(node)) {
		const result = /\(\s*\)\s*=>/.exec(newText)
		if (result && result.length) {
			newText = newText.substring(result.index + result[0].length, newText.length)
		}
	}
	else if (!isDeclaration(node) || ts.isVariableDeclaration(node)) {
		//no nothing, default value for newText seems to be doing fine
	}
	return newText
}

export function getTypeFor(node: ts.Node, program: ts.Program): ts.Type {
	return program.getTypeChecker().getTypeAtLocation(node)
}
/**
 * Determines whether a given TypeScript node has a declared type.
 *
 * @param node - The TypeScript node to check.
 * @param program - The TypeScript program instance, used to retrieve the type checker.
 * @returns `true` if the node has a declared type; otherwise, `false`.
 */
export function hasDeclaredType(node: ts.Node, program: ts.Program): boolean {
	if (!(node as any).type) {
		return false;
	}
	const type = program.getTypeChecker().getTypeAtLocation(node)
	if (!type || !type.symbol) {
		return false
	} else {
		return true
	}
}

// identifiers helpers

export function findIdentifier(node: ts.Node | undefined): ts.Identifier {
	return node.kind === ts.SyntaxKind.Identifier ? node as ts.Identifier : findChild(node, child => child.kind === ts.SyntaxKind.Identifier, false) as ts.Identifier
}
/**
 * Finds the identifier string representation of a given TypeScript node.
 *
 * This function attempts to locate an identifier within the provided node
 * and returns its string representation. If no identifier is found or the
 * node is undefined, an empty string is returned.
 *
 * @param node - The TypeScript node to search for an identifier. Can be undefined.
 * @returns The string representation of the identifier if found, otherwise an empty string.
 */
export function findIdentifierString(node: ts.Node | undefined): string {
	const id = findIdentifier(node)
	return id && id.escapedText ? id.escapedText + '' : ''
}
