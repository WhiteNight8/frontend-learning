```js
function h(tag,props,children) {
    return {tag,props,children}
}

function diff(oldNode,newNode) {
    //type
    if(oldNode.tag !== newNode.tag) {
        return {type:'REPLACE',newNode}
    }
    
    const patches = []
    //attribute
    const propsPatches = diffProps(oldNode.props, newNode.props)
    if(Object.keys(propsPatches).length > 0) {
        patch.push({type:'PROPS',props:propsPatches})
    }
    //children
    if(!Array.isArray(oldNode.children) || !Array.isArray(newNode.children)) {
        if(oldNode.chidlren!== newNode.chidlren) {
            patches.push({type:'TEXT',text:newNode.children})
        }
    } else {
  		const childPatches = diffChildren(oldNode.children,newNode.children)      
        patches.push(...childPatches)
    }
    return patches
}

function diffChildren(oldChildren,newChildren) {
	const patches = []
    
    oldChildren.forEach((oldChild,i) => {
        if(i < newChildren.length) {
            const childPatches = diff(oldChild,newChildren[i])
            if(childPatches.length > 0) {
                patches.push({type:'CHILD',index:i,patches:childPatches})
            }
        } else {
            patches.push({type:'REMOVE',index:i})
        }
    })
    
    // add new nodes
    for(let i = oldChildren.length; i < newChildren.length;i++) {
        pathces.push({type:'ADD',node:newChildren[i],index:i})
    }
    return patches
}

function patch(node,patches) {
    patches.forEach(patch => {
        switch(patch.type) {
            case 'REPlACE':
                node.parentNode.replaceChild(render(patch.newNode),node)
                break
            case'PROPS' :
                patchProps(node,patch.props)
                break
            case 'TEXT' :
                node.textContent = patch.text
                break
            case 'CHILD':
                patch.patches.forEach( childPatch => {
                    patch(node.childNode[patch.index],childPatch)
                })
                break
            case 'REMOVE':
                node.parentNode.removeChild(node.childNodes[patch.index])
                break
            case 'ADD':
                node.appendChild(render(patch.node))
                break
        }
    })
}

function patchProps(node,props) {
    for(const key in props) {
        const value = props[key]
        if(value === null) {
            node.removeAttribute(key)
        } else {
            node.setAttribute(key,value)
        }
    }
}

function render(vnode) {
    if(typeof vnode === 'string' || typeof node === 'number') {
        return document.createTextNode(vnode)
    }
    
    const element = document.createElement(vnode.tag)
    
    if(vnode.props) {
        for(const key in vnode.props) {
            element.setAttribute(key,vnode.props[key])
        }
    }
    
    if(vnode.children) {
        if(Array.isArray(vnode.children)) {
            vnode.children.forEach( child => {
                element.appendChild(render(child))
            })
        } else {
            element.textContent = vnode.chidlren
        }
    }
    return element
}
```

