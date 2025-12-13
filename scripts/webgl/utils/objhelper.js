export function groupBy(array, keyFn) {
    return array.reduce((result, item) => {
        const key = keyFn(item); 
        if (key) {
            if (!result[key]) result[key] = [];
            result[key].push(item);
        }
        return result;
    }, {});
}
