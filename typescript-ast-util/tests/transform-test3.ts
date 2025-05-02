import ts, { factory } from 'typescript';

// since having function declarations without name is an error in TypeScript this transformation will put them name

function main(source: string, log: (m: string) => void): string {
	let nameCounter = 0
	const transformFactory: ts.TransformerFactory<ts.SourceFile> = (context) => (rootNode) => {
		const visit: ts.Visitor = (node) => {
			node = ts.visitEachChild(node, visit, context);
			if (ts.isFunctionDeclaration(node) && (!node.name || !node.name.escapedText)) {
				// we can actually change the node using two techniques, the first one is creating a new mutable 
				// clone and modify it and return it
				return factory.createFunctionDeclaration(
					node.modifiers,
					node.asteriskToken,
					factory.createIdentifier('unnamedFunc' + nameCounter++),
					node.typeParameters,
					node.parameters,
					node.type,
					node.body
				)

				// or also we could create a new node using the ts.create* functions : 

				// return ts.createFunctionDeclaration(node.decorators, node.modifiers, node.asteriskToken,
				//   ts.createIdentifier('unnamedFunc'), node.typeParameters, node.parameters, node.type, node.body)
			}
			return node
		}
		return ts.visitNode(rootNode, visit) as ts.SourceFile;
	}

	const sourceFile = ts.createSourceFile(
		'test.ts', source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
	)
	const result = ts.transform(sourceFile, [transformFactory])
	const transformedContent = ts.createPrinter().printFile(result.transformed[0])
	log('Nodes changed : ' + nameCounter)
	return transformedContent
}


const source = `
function(a: number):[number]{
    return [Math.PI*a/2]
}
function named(b:string){
    function():string {return ''}
    return 123
}
const alsoWithName = function(){
    return function(){} // let's see what happens with this one
}; 

(function (a: number) { return a + 1; })(5); // and with this one
`