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