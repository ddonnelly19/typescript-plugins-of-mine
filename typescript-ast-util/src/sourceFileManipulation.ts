import ts from 'typescript';
// source file manipulation

export interface Position {
	readonly line: number;
	readonly character: number;
}

export interface TextChange {
	readonly start: number
	readonly end: number
	readonly newText: string;
}

/**
 * Updates a TypeScript `SourceFile` by applying a specified text change.
 *
 * @param sourceFile - The original `SourceFile` to be updated.
 * @param textChange - An object representing the text change to apply. It includes:
 *   - `start`: The starting position of the text change.
 *   - `end`: The ending position of the text change.
 *   - `newText`: The new text to insert between the start and end positions.
 * @returns A new `SourceFile` instance with the specified text change applied.
 *
 * @remarks
 * This function creates a new source file by modifying the original source file's text
 * and updating its text change range. It does not mutate the original `SourceFile`.
 *
 * @example
 * ```typescript
 * const updatedSourceFile = updateSourceFile(sourceFile, {
 *   start: 10,
 *   end: 20,
 *   newText: "new content"
 * });
 * ```
 */
export function updateSourceFile(sourceFile: ts.SourceFile, textChange: TextChange): ts.SourceFile {
	const currentSource = sourceFile.getFullText();
	const updateStartPosition = textChange.start
	const updateEndPosition = textChange.end
	const oldSourceBeforeChange = currentSource.slice(0, updateStartPosition);
	const oldSourceAfterChange = currentSource.slice(updateEndPosition);
	const newSource = oldSourceBeforeChange + textChange.newText + oldSourceAfterChange;
	const textChangeRange: ts.TextChangeRange = {
		span: {
			start: updateStartPosition,
			length: updateEndPosition - updateStartPosition
		},
		newLength: textChange.newText.length
	};
	return sourceFile.update(newSource, textChangeRange);
}


/**
 * @param sourceFile 
 * @param positionWhereToAdd (spanStart)
 * @param textToAdd 
 * @return the sourceFile with the modifications
 */
export function addTextToSourceFile(sourceFile: ts.SourceFile, positionWhereToAdd: number, textToAdd: string/* , charCountToDeleteFromPos: number = 0 */): ts.SourceFile {

	return updateSourceFile(sourceFile, { start: positionWhereToAdd, end: positionWhereToAdd, newText: textToAdd })
	// const spanLength = 0//charCountToDeleteFromPos // not removing 
	// const oldTextLength = sourceFile.text.length
	// const newText = sourceFile.text.substring(0, positionWhereToAdd) + textToAdd + sourceFile.text.substring(positionWhereToAdd, sourceFile.text.length)
	// // forcing the newLength so ts asserts wont fail:
	// // ts.Debug.assert((oldText.length - textChangeRange.span.length + textChangeRange.newLength) === newText.length)
	// const newLength = spanLength + newText.length - sourceFile.text.length
	// return ts.updateSourceFile(sourceFile, newText, { span: { start: positionWhereToAdd, length: spanLength }, newLength: newLength }, true)
	// // return sourceFile.update(newText, { span: { start: positionWhereToAdd, length: spanLength }, newLength: newLength })
}


