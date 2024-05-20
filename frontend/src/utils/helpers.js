export function getNestedProperty(obj, path) {
    return path.split('.').reduce((currentObject, key) => {
        return currentObject ? currentObject[key] : undefined
    }, obj)
}