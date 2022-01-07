export function getPartsIndexes (post, parts) {
    
    const partsIndexes = [];
    parts.forEach(part => {
        const index = post.indexOf(part);
        if (index > -1) {
            partsIndexes.push({ start:  index, end: index + part.length});
        }
    });
    return partsIndexes;
}

export function fillBlanks (arr, max) {
    const full = [];
    
    if (arr.length === 0) {
        full.push({ start: 0, end: max });
    }
    else if (arr[0].start !== 0) {
        full.push({ start: 0, end: arr[0].start });
    }
    
    arr.forEach((i, index) => {
        full.push({ ...i, isFragment: true })
        if (index < arr.length - 1) {
            full.push({ start: i.end, end: arr[index+1].start });
        }
        else {
            full.push({ start: i.end, end: max });
        }
    });
    
    return full;
}

function removeNewLine (str) {
    const indexes = [];
    while (str.indexOf("\n") > -1) {
        const index = str.indexOf("\n");
        indexes.push(index + (0 && (indexes.length * 2)))
        str = str.slice(0, index) + str.slice(index + 1);
    }
    return { str, indexes };
}

function countOccurence (arr, num) {
    let count = 0;
    arr.forEach(a => a === num && count++);
    return count;
}

function addNewLine (string, indexes) {
    let str = "";
    const length = string.length;
    
    for (let i = 0; i < length; i++) {
        const count = countOccurence(indexes, i)
        if (count > 0) {
            str += "\n".repeat(count);
        }
        str += string[i];
    }
    
    return str;
}

function addHighlights (parts) {
    let string = "";
    parts.forEach(part => {
        if (part.isFragment)
            string += "<" + part.text + ">";
        else
            string += part.text;
    });
    return string;
}

export function getParts (post, fragments) {
    const parts = [];
    let indexes = getPartsIndexes(post, fragments);
    arraySort(indexes, "start");
    indexes = fillBlanks(indexes, post.length);
    let cursor = 0;
    console.log(indexes)
    indexes.forEach(index => {
        const startIndex = index.start > cursor ? index.start : cursor;
        parts.push({
            text: post.substr(startIndex, index.end - startIndex),
            isFragment: index.isFragment
        });
        cursor = index.end;
    });
    return parts;
}

function incArray (array, min) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] >= min) {
            array[i]++;
        }
    }
}

export function search (post, fragments) {   
    console.log(post)
    const { str, indexes } = removeNewLine(post);
    const parts = getParts(str, fragments);
    const highlightedString = addHighlights(parts);
    
    parts.forEach(part => {
        incArray(indexes, part.startIndex);
    });
    
    return addNewLine(highlightedString, indexes);
}