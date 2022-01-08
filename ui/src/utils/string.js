import arraySort from "array-sort";

function getPartsIndexes (post, parts) {
    
    const partsIndexes = [];
    parts.forEach(part => {
        const index = post.indexOf(part);
        if (index > -1) {
            partsIndexes.push({ start:  index, end: index + part.length});
        }
    });
    return partsIndexes;
}

function fillBlanks (arr, max) {
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
function getParts (post, fragments) {
    const parts = [];
    let indexes = getPartsIndexes(post, fragments);
    arraySort(indexes, "start");
    indexes = fillBlanks(indexes, post.length);
    let cursor = 0;
    indexes.forEach(index => {
        const startIndex = index.start > cursor ? index.start : cursor;
        parts.push({
            text: post.substr(startIndex, index.end - startIndex),
            isFragment: index.isFragment,
            startIndex,
            endIndex: index.end
        });
        cursor = index.end;
    });
    return parts;
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
    arr.forEach(a => a === num ? count++ : "");
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
            string += "<span class='frag-sep'>" + part.text + "</span>";
        else
            string += part.text;
    });
    return string;
}
function incArray (array, min, inc) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] > min) {
            array[i] += inc;
        }
    }
}

export function search (post, fragments) {   
    const { str, indexes } = removeNewLine(post);
    console.log(indexes);
    const parts = getParts(str, fragments);
    const highlightedString = addHighlights(parts);
    let fc = 0;
    parts.forEach(part => {
        const startStrLen = 23;
        const endStrLen = 7;
        if (part.isFragment) {
            incArray(indexes, part.startIndex + (fc * (startStrLen + endStrLen)), 23);
            incArray(indexes, part.endIndex + (fc * (startStrLen + endStrLen)), 7);
            fc++;
        }
    });
    return addNewLine(highlightedString, indexes);
}