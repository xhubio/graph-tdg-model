'use strict'

// import logger from 'winston'
import assert from 'assert'

const TYPE_CHILDREN = 'children'
const TYPE_PARENT = 'parent'
const TYPE_LINK = 'link'
const TYPE_ROOT = 'root'
const TYPE_CHILD = 'child'

export default class GraphModelBuilder {
  constructor() {
    // The graph model to be created
    this.model = {}

    // while parsing this array stores all the found links
    this.links = []

    // stores all the errors of this model
    this.errors = []
  }

  /**
	 * Creates a new graph representation of the generation model.
	 * @param nodeGenerationModel {object} The parent object. This object is from the original generation model
	 * @param parentName {string} The name of the parent object
	 */
  createModel(generationModel) {
    this._traverseGenerationModel({ generationModel })
    this._handleLinks()
    return this.model
  }

  /**
	 * Creates the link edges and checks if the objects are existing
	 */
  _handleLinks() {
    this.links.forEach(link => {
      const source = link.source
      const target = link.target
      if (this.model[target === undefined]) {
        this.errors.push(
          `The target '${target}' for the outgoing link at '${source}' does not exists`
        )
      } else {
        this._createLinkEdges({ link })
      }
    })
    this.links = []
  }

  /**
	 * Create the incomming and outgoing edges for a link relationship
	 * @param link {object} The link object
	 */
  _createLinkEdges({ link }) {
    link.type = TYPE_LINK
    const source = link.source
    const target = link.target

    const sourceNode = this.model[source]
    const targetNode = this.model[target]

    sourceNode.edgesOut.push(link)
    targetNode.edgesIn.push(link)
  }

  /**
	 * Create the incomming and outgoing edges for a parent child relationship
	 * @param parent {string} The name of the parent node
	 * @param child {string} The name of the child node
	 */
  _createParentChildEdges({ parent, child }) {
    const parentNode = this.model[parent]
    const childNode = this.model[child]
    parentNode.edgesOut.push({ type: TYPE_CHILDREN, ref: child })
    childNode.edgesIn.push({ type: TYPE_PARENT, ref: parent })
  }

  /**
	 * Creates a new graph representation of the generation model.
	 * @param generationModel {object} The parent object. This object is from the original generation model
	 * @param parentName {string} The name of the parent object
	 */
  _traverseGenerationModel({ generationModel, parentName }) {
    assert.ok(generationModel, `The 'generationModel' object must not be null`)

    // ---------------------------------
    // work on children
    // ---------------------------------
    Object.keys(generationModel).forEach(childName => {
      const generationModelPart = generationModel[childName]
      generationModelPart.name = childName

      this._handleObject({ parent: parentName, child: childName })

      // has children
      if (generationModelPart.children !== undefined) {
        this._traverseGenerationModel({
          generationModel: generationModelPart.children,
          parentName: childName,
        })
      }

      // has links
      if (generationModelPart.links !== undefined) {
        Object.keys(generationModelPart.links).forEach(targetName => {
          const link = generationModelPart.links[targetName]
          link.source = childName
          link.target = targetName

          // stores the links for later processing
          this.links.push(link)
        })
      }
    })
  }

  /**
	 * Handles a single object for parent child traversing. Adds the node
	 * to the model and creates the edges
	 * @param parent {string} The name of the parent node
	 * @param child {string} The name of the child node
	 */
  _handleObject({ parent, child }) {
    if (this.model[child] !== undefined) {
      this.errors.push(`The node '${child}' is double defined`)
    }
    this.model[child] = { name: child, parent, edgesIn: [], edgesOut: [] }

    if (parent !== undefined) {
      this._createParentChildEdges({ parent, child })
      this.model[child].type = TYPE_CHILD
    } else {
      // in this case it is a root node
      this.model[child].type = TYPE_ROOT
    }
  }
}
