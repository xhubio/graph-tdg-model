[![npm](https://img.shields.io/npm/v/.svg)](https://www.npmjs.com/package/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com//)
[![Build Status](https://secure.travis-ci.org//.png)](http://travis-ci.org//)
[![bithound](https://www.bithound.io/github///badges/score.svg)](https://www.bithound.io/github//)
[![codecov.io](http://codecov.io/github///coverage.svg?branch=master)](http://codecov.io/github//?branch=master)
[![Coverage Status](https://coveralls.io/repos///badge.svg)](https://coveralls.io/r//)
[![Code Climate](https://codeclimate.com/github///badges/gpa.svg)](https://codeclimate.com/github//)
[![Known Vulnerabilities](https://snyk.io/test/github///badge.svg)](https://snyk.io/test/github//)
[![GitHub Issues](https://img.shields.io/github/issues//.svg?style=flat-square)](https://github.com///issues)
[![Stories in Ready](https://badge.waffle.io//.svg?label=ready&title=Ready)](http://waffle.io//)
[![Dependency Status](https://david-dm.org//.svg)](https://david-dm.org//)
[![devDependency Status](https://david-dm.org///dev-status.svg)](https://david-dm.org//#info=devDependencies)
[![docs](http://inch-ci.org/github//.svg?branch=master)](http://inch-ci.org/github//)
[![downloads](http://img.shields.io/npm/dm/.svg?style=flat-square)](https://npmjs.org/package/)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)


=====



API Reference
=====

* <a name="getHash"></a>

## getHash() ⇒ <code>string</code>
Creates the MD5 hash for this object

**Kind**: global function  
**Returns**: <code>string</code> - The hash value as string  

* <a name="getHashValue"></a>

## getHashValue() ⇒ <code>number</code>
Creates the MD5 hash for this object

**Kind**: global function  
**Returns**: <code>number</code> - The hash value as number  

* <a name="setAllAttributes"></a>

## setAllAttributes(attributeValues)
Set all the given attributes in one go.
Only the attributes defined for this class will be set

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| attributeValues | <code>object</code> | The attributes values to set |


* <a name="_setParent"></a>

## _setParent(propertyName, object)
Set a new parent for this object

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| propertyName | <code>string</code> | The name of the reference this object was added to |
| object | <code>object</code> | The object this object was added to a reference. If the new object is undefined                          It means that the parent should be deleted |


* <a name="_getParent"></a>

## _getParent() ⇒ <code>object</code>
Returns the parent of this object. An parent only exists if this object
is a conained object.

**Kind**: global function  
**Returns**: <code>object</code> - The parent of this object  

* <a name="_removeFromParent"></a>

## _removeFromParent(propertyName)
Removes this object from its parent, if it has one

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| propertyName | <code>string</code> | The name of the reference this object was added to |


* <a name="_addOpositeReference"></a>

## _addOpositeReference(propertyName, sourceElement)
Add a reference for this object. If this object is added to an other object, the other object references this.
This stores the oposite of a normal attribute.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| propertyName | <code>string</code> | The name of the reference this object was added to |
| sourceElement | <code>object</code> | The element this object was added. |


* <a name="_removeOpositeReference"></a>

## _removeOpositeReference(propertyName, sourceElement)
Referenced objects store all the incomming references to this object.
This method will remove an object from this references.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| propertyName | <code>string</code> | The name of the reference this object was added to |
| sourceElement | <code>object</code> | The object to be deleted from the incomming references |


* <a name="getHashValue"></a>

## getHashValue() ⇒ <code>number</code>
Returns the hash value of this list

**Kind**: global function  
**Returns**: <code>number</code> - The claculated hashValue as number  

* <a name="_handleAdd"></a>

## _handleAdd()
If an element is added or removed some

**Kind**: global function  

* <a name="_getElementForObject"></a>

## _getElementForObject(element) ⇒ <code>object</code>
Internal helper method. It will return the real object. If the id is given
it will retrive the original object for the ID first. Then it will proof
that the object is of the given type.

**Kind**: global function  
**Returns**: <code>object</code> - The real object if it could be found  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>object</code> | The element or element id to be prooved. |


* <a name="has"></a>

## has(element) ⇒ <code>boolean</code>
Returns a boolean value indicating if this list contains the given element or not

**Kind**: global function  
**Returns**: <code>boolean</code> - True if the element exists in the list  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>object</code> | The element to be searched in the list |


* <a name="size"></a>

## size() ⇒ <code>number</code>
Returns the ammount of stored elements

**Kind**: global function  
**Returns**: <code>number</code> - The size of the stored elements  

* <a name="add"></a>

## add(element)
Adds a new element

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>object</code> | The element to be added |


* <a name="remove"></a>

## remove(element)
Removes the given element from the list if it exists.
If the list is not unique it will remove the last one.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>object</code> | The element to be removed |


* <a name="forEach"></a>

## forEach(callback)
The forEach() method executes a provided function once per each value in the Set object, in insertion order.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | Function to execute for each element. |


* <a name="clear"></a>

## clear()
clears the list of stored elements

**Kind**: global function  

* * *

install
=======

With [npm](http://npmjs.org) do:

```shell
npm install 
```

license
=======

BSD-2-Clause
