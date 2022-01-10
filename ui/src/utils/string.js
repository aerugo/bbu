import arraySort from "array-sort";

function replaceAfter(target, search, replace, from) {
    if (target.length > from) {
      return target.slice(0, from) + target.slice(from).replace(search, replace);
    }
    return target;
}

function getPartsIndexes (post, parts) {
    
    const partsIndexes = [];
    parts.forEach(part => {
        const index = post.indexOf(part);
        if (index > -1) {
            console.log("Matched", part);
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
    indexes = removeOverlaps(indexes);
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

function removeOverlaps (arr) {
    for (let i = 0; i < arr.length-1; i++) {
        for (let j = i+1; j < arr.length; j++) {
            const { start:b1, end:e1 } = arr[i];
            const { start:b2, end:e2 } = arr[j];
            const hasOverlap = (
                (b1 === b2 && e1 === e2)
               || (b1 <= b2 && b2 <= e1)
               || (b1 <= e2 && e2 <= e1)
               || (b2 <= b1 && b1 <= e2)
               //|| (b2 <= e2 && e2 <= e2)
            )
            
            if (!hasOverlap || arr[i].remove) {
                continue
            }
            
            let oc = 0;
            if (
                arr[i].start >= arr[j].start
            ) {
                arr[i].start = arr[j].start
                arr[j].remove = true;
                oc++;
            }
            if (arr[i].end <= arr[j].end) {
                arr[i].end = arr[j].end
                arr[j].remove = true;
                oc++
            }
            if (oc === 0)
                arr[j].remove = true
        }
    }
    return arr.filter((el, index) => {
        return !el.remove
    })
}

export function search (post, fragments) {
    console.log('MATCHES');  
    const { str, indexes } = removeNewLine(post);
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

export function validateHtml2 (target) {
    const r1 = "<span class='frag-sep'><p>";
    const s1 = "<p><span class='frag-sep'>";

    const r2 = "</span></p>";
    const s2 = "</p></span>";
    
    let v = target.replace(new RegExp(s1, 'g'), r1);
    v = v.replace(new RegExp(s2, 'g'), r2);

    return v;
}

export function validateHtml (target) {
    const r1 = `<span class="frag-sep"><p>`;
    const r11 = `<p><span class="frag-sep">`;
    const s1 = "<p><span class='frag-sep'>";

    const r2 = "</span></p>";
    const s2 = "</p></span>";
    const s3 = "</span>";
    const s4 = "</p>";

    let v = target;
    let index = target.indexOf(s1);
    
    while (index > -1) {

        const s3Index = target.indexOf(s3, index);
        const s4Index = target.indexOf(s4, index);

        if (s3Index < s4Index) {
            v = v.replace(s1, r11);
        }
        else {
            v = v.replace(s1, r1);
            v = replaceAfter(v, s2, r2, index);
        }

        index = v.indexOf(s1);
    }

    return v;
}