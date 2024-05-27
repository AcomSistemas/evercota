export function handleChangeImage(component, object, hexString, fieldName, callback) {
    object[fieldName] = hexString
    component.setState(object, callback)
}

export function handleChangeText(object, keyPath, value, callback) {
    // Separa o keyPath em uma array de chaves
    const keys = keyPath.split(".");
  
    // Navega pelo objeto até a chave final
    let currentObject = object;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!currentObject.hasOwnProperty(keys[i])) {
            currentObject[keys[i]] = {};
        }
        currentObject = currentObject[keys[i]];
    }
  
    // Atualiza o valor da chave final
    currentObject[keys[keys.length - 1]] = value;

    callback()
}