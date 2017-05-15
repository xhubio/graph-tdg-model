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

* <a name="getAveragePerIteration"></a>

## getAveragePerIteration(iterations, count) ⇒ <code>object</code>
Create the minimum and maximum change per iteration

**Kind**: global function  
**Returns**: <code>object</code> - result  The object with the created values  

| Param | Type | Description |
| --- | --- | --- |
| iterations | <code>number</code> | The count of iterations |
| count | <code>number</code> | How many data should be created at whole |


* <a name="rampPerParent"></a>

## rampPerParent(iterations, parentRamp, objectConfig, perParent, perIteration, name) ⇒ <code>object</code>
Create the ramp for the child components. These are depending on there parents

const ramp = {
	 "<iteration id>": {
    "add": <amount of data to be added in this iteration>
  }
}

**Kind**: global function  
**Returns**: <code>object</code> - result  The amount of data to be created per iteration  

| Param | Type | Description |
| --- | --- | --- |
| iterations | <code>number</code> | The count of iterations |
| parentRamp | <code>object</code> | The ramp up data object from the parent object |
| objectConfig | <code>object</code> | The configuration of this object |
| perParent | <code>object</code> | This object contains the imformation how to create the data per parent |
| perIteration | <code>object</code> | This object contains the imformation how to create the data per iteration |
| name | <code>string</code> | The name of the object working on |


* <a name="createRamp"></a>

## createRamp(iterations, start, end, min, max, name) ⇒ <code>object</code>
Create the ramp of data changes per iteration. This method is called for all the topLevel components

**Kind**: global function  
**Returns**: <code>object</code> - result  The amount of data to be created per iteration  

| Param | Type | Description |
| --- | --- | --- |
| iterations | <code>number</code> | The count of iterations |
| start | <code>number</code> | How many data should be created for iteration one |
| end | <code>number</code> | How many data should be created after the last iteration |
| min | <code>number</code> | The minimum of data which should be created per iteration |
| max | <code>number</code> | The maximum of data to be created per iteration |
| name | <code>string</code> | The name of the object working on |


* <a name="addData"></a>

## addData(average, rampObject, changeSum, end, max) ⇒ <code>object</code>
Adds the data for a specified iteration

**Kind**: global function  
**Returns**: <code>object</code> - res  The ramp part of the current index and the changeSum  

| Param | Type | Description |
| --- | --- | --- |
| average | <code>object</code> | The computed average object |
| rampObject | <code>object</code> | The data ramp object on a specific ramp index |
| changeSum | <code>number</code> | The current change summary value |
| end | <code>number</code> | The maximal amount of data to create |
| max | <code>number</code> | The maximal amount of data to be added in one iteration |


* <a name="createSum"></a>

## createSum(ramp)
Takes a ramp up data object and enters the sum field.
The given data will be updated.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ramp | <code>object</code> | The data ramp to add the sum field |


* <a name="createTimeRamp"></a>

## createTimeRamp()
Create the time ramp and dependencies between the objects.
Defines how many object should be created for each iteration

The created data ramo looks like this:
 {
 		"<objectName>": {
    		"<iteration>": {
       "add"    : 5,												// how many objects will be added in this iteration
       "sum"    : 123											// how many objects where already added by this and the other iterations
				"parent" : "<parentObjectName>",		// only set if this is not a root object
				"dist"   : [[0,16], [17,45], [46,66], [67,97]] // how many new objectz belong to which parent
    }
 }
The 'dist' property is an array. Each position in this array references the parent element. In this example
the parent has 4 elements. The first parent element will get the child element 0 to 16. So the elements
in the sub array defining a range of elements.

**Kind**: global function  

* <a name="workOnChildren"></a>

## workOnChildren(timeShift, generationOrder, parentTimeRamp, parentName) ⇒ <code>object</code>
Works on the elements of the generationOrder. It traveres this tree
recursivly.

**Kind**: global function  
**Returns**: <code>object</code> - result  The amount of data to be created per iteration  

| Param | Type | Description |
| --- | --- | --- |
| timeShift | <code>number</code> | The timeShift configuration |
| generationOrder | <code>object</code> | The tree defining how to generate the objects |
| parentTimeRamp | <code>object</code> | The ramp up data object from the parent object |
| parentName | <code>string</code> | The name of the parent object |


* <a name="createRamp"></a>

## createRamp(iterations, objectConfig, parentRamp, parentName) ⇒ <code>object</code>
Creates the timeramp for one object

**Kind**: global function  
**Returns**: <code>object</code> - result  The amount of data to be created per iteration  

| Param | Type | Description |
| --- | --- | --- |
| iterations | <code>number</code> | The count of iterations |
| objectConfig | <code>object</code> | The configuration of this object |
| parentRamp | <code>object</code> | The ramp up data object from the parent object |
| parentName | <code>string</code> | The name of the parent object |


* <a name="createSum"></a>

## createSum(ramp)
Takes a ramp up data object and enters the sum field and also adjust the tmpDist to dist Array

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ramp | <code>object</code> | The data ramp to add the sum field |


* <a name="addChangeSum"></a>

## addChangeSum(changeSum, newResult) ⇒ <code>number</code>
Updates the change sum. The new value will be returned

**Kind**: global function  
**Returns**: <code>number</code> - changeSum  The new updated changeSum  

| Param | Type | Description |
| --- | --- | --- |
| changeSum | <code>number</code> | The current changeSum |
| newResult | <code>object</code> | The result to be merged |


* <a name="getAveragePerIteration"></a>

## getAveragePerIteration(iterations, count) ⇒ <code>object</code>
Create the minimum and maximum change per iteration.
It takes the count and devides it be the amount of iterations.
this is the number of everage elememnts per iteration

**Kind**: global function  
**Returns**: <code>object</code> - result  The object with the created values  

| Param | Type | Description |
| --- | --- | --- |
| iterations | <code>number</code> | The count of iterations |
| count | <code>number</code> | How many data should be created at whole |


* <a name="mergeResult"></a>

## mergeResult(iteration, result, newResult)
Merges the new result into the existing one

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| iteration | <code>object</code> | The current iteration |
| result | <code>object</code> | The current existing result for all the iterations |
| newResult | <code>object</code> | The result to be merged (only one iteration) |


* <a name="createMinVal"></a>

## createMinVal(min, parentCount, isChild) ⇒ <code>object</code>
Creates the min values for one iteration

**Kind**: global function  
**Returns**: <code>object</code> - res  A timeRamp object part  

| Param | Type | Description |
| --- | --- | --- |
| min | <code>number</code> | The minimum count of objects |
| parentCount | <code>object</code> | The time ramp of the parent object |
| isChild | <code>boolean</code> | If true, then this is a child object |


* <a name="createStartVal"></a>

## createStartVal(start, alreadyAdded, currentTmpDist, parentCount, isChild) ⇒ <code>object</code>
Creates the start values for the first iteration.

**Kind**: global function  
**Returns**: <code>object</code> - res  A timeRamp object part  

| Param | Type | Description |
| --- | --- | --- |
| start | <code>number</code> | The start count of objects. |
| alreadyAdded | <code>number</code> | The already existing count |
| currentTmpDist | <code>object</code> | The already existing tmpDist array for this iteration |
| parentCount | <code>number</code> | The number of the parent objects. |
| isChild | <code>boolesn</code> | If true, then this is a child object |


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
