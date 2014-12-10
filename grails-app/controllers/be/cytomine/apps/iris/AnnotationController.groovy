package be.cytomine.apps.iris

import grails.converters.JSON

import org.codehaus.groovy.runtime.typehandling.GroovyCastException;
import org.json.simple.JSONArray
import org.json.simple.JSONObject

import be.cytomine.client.Cytomine
import be.cytomine.client.CytomineException;
import be.cytomine.client.collections.AnnotationCollection;
import be.cytomine.client.collections.TermCollection;
import be.cytomine.client.models.Annotation;
import be.cytomine.client.models.AnnotationTerm;
import be.cytomine.client.models.ImageInstance;
import be.cytomine.client.models.Ontology
import be.cytomine.clientx.CytomineX;


/**
 * 
 * @author Philipp Kainz
 *
 */
class AnnotationController {

	def grailsApplication
	def sessionService
	def annotationService

	def beforeInterceptor = {
		log.debug("Executing action $actionName with params $params")
	}

	/**
	 * Get all annotations for a specific project and image.
	 * 
	 * @return the annotations as JSON array
	 */
	def getAnnotations(){
		try {
			Cytomine cytomine = request['cytomine']
			String publicKey = params['publicKey']

			long sessionID = params.long('sessionID')
			long projectID = params.long('cmProjectID')

			// filter for a specific project/image/term
			Map<String,String> filters = new HashMap<String,String>()
			filters.put("project", String.valueOf(projectID))
			filters.put("showGIS", "true") // show the centroid information on the location
			filters.put("showMeta", "true") // show the meta informations
			filters.put("showTerm", "true") // show the term informations

			String imageIDs = params['image']
			if (imageIDs != null){
				filters.put("image", String.valueOf(imageIDs))
			}

			// filter for terms
			String termIDs = params['term']
			if (termIDs != null){
				filters.put("term", String.valueOf(termIDs))
			}
			// additionally check for termID 0, this will be annotations without terms
			if (params['noTerm'] != null && params['noTerm'].equals("true")){
				filters.put("noTerm", "true")
			}
			// check for multiple terms
			if (params['multipleTerm'] != null && params['multipleTerm'].equals("true")){
				filters.put("multipleTerm", "true")
			}

			// TODO implement pagination
			int max = (params['max']==null?0:params.int('max'))

			// get the session and the user
			Session sess = Session.get(sessionID)
			User user = sess.getUser()

			// find the project
			Project p = sess.getProjects().find { it.cmID == projectID }
			long ontologyID = p.getCmOntology();

			// fetch the terms from the ontology
			TermCollection terms = cytomine.getTermsByOntology(ontologyID)

			// get all annotations according to the filter
			AnnotationCollection annotations = cytomine.getAnnotations(filters)
			def irisAnnList = new JSONArray()

			// create a new domain mapper
			DomainMapper dm = new DomainMapper(grailsApplication)

			for(int i=0;i<annotations.size();i++) {
				Annotation annotation = annotations.get(i)

				// map the annotation to the IRIS model
				be.cytomine.apps.iris.Annotation irisAnn = dm.mapAnnotation(annotation, null)

				irisAnn = annotationService.resolveTerms(ontologyID, terms, user, annotation, irisAnn)

				// ######################################################################################
				// IMPORTANT: do NOT inject the cytomine annotation, because they contain information on
				// mappings done by other users
				// ######################################################################################
				// add the annotation to the result and use the AnnotationMarshaller in order to
				// serialize the domain objects
				irisAnnList.add(irisAnn)
			}

			render (irisAnnList as JSON)

		} catch(CytomineException e1){
			// exceptions from the cytomine java client
			response.setStatus(e1.httpCode)
			JSONObject errorMsg = new Utils().resolveCytomineException(e1)
			render errorMsg as JSON
		} catch(GroovyCastException e2) {
			// send back 400 if the project ID is other than long format
			response.setStatus(400)
			JSONObject errorMsg = new Utils().resolveException(e2, 400)
			render errorMsg as JSON
		} catch(Exception e3){
			// on any other exception render 500
			response.setStatus(500)
			JSONObject errorMsg = new Utils().resolveException(e3, 500)
			render errorMsg as JSON
		}
	}

	/**
	 * 
	 * @return
	 */
	def setUniqueTerm(){
		try {Cytomine cytomine = request['cytomine']
			CytomineX cX = new CytomineX(cytomine.host, cytomine.publicKey, cytomine.privateKey, cytomine.basePath)

			long sessionID = params.long('sessionID')
			long cmProjectID = params.long('cmProjectID')
			long cmImageID = params.long('cmImageID')
			long cmAnnID = params.long('cmAnnID')
			long cmTermID = params.long('cmTermID')

			def payload = (request.JSON)
			// something like {annotation: 12345, term: 1239458}
			long pldTermID = Long.valueOf(payload.get('term'))
			long pldAnnID = Long.valueOf(payload.get('annotation'))

			if (pldAnnID != cmAnnID || pldTermID != cmTermID){
				throw new IllegalArgumentException("The identifiers in URL and payload do not match!")
			}

			// set the term to the annotation
			AnnotationTerm annTerm = cX.setAnnotationTerm(cmAnnID, pldTermID)

			render (annTerm.getAttr() as JSON)

		} catch(CytomineException e1){
			// exceptions from the cytomine java client
			response.setStatus(e1.httpCode)
			JSONObject errorMsg = new Utils().resolveCytomineException(e1)
			render errorMsg as JSON
		} catch(GroovyCastException e2) {
			// send back 400 if the project ID is other than long format
			response.setStatus(400)
			JSONObject errorMsg = new Utils().resolveException(e2, 400)
			render errorMsg as JSON
		} catch(Exception e3){
			// on any other exception render 500
			response.setStatus(500)
			JSONObject errorMsg = new Utils().resolveException(e3, 500)
			render errorMsg as JSON
		}
	}

	/**
	 * Touches an annotation and adds it to the image.
	 * 
	 * @return
	 */
	def touchAnnotation(){
		try {
			// TODO insert the annotation into the database and send back the object as "current" annotation
			Cytomine cytomine = request['cytomine']
			long sessionID = params.long('sessionID')
			long cmProjectID = params.long('cmProjectID')
			long cmImageID = params.long('cmImageID')
			long cmAnnID = params.long('cmAnnID')

			def irisAnn = sessionService.touchAnnotation(cytomine, sessionID, cmProjectID, cmImageID, cmAnnID);

			render irisAnn as JSON
		} catch(CytomineException e1){
			// exceptions from the cytomine java client
			response.setStatus(e1.httpCode)
			JSONObject errorMsg = new Utils().resolveCytomineException(e1)
			render errorMsg as JSON
		} catch(GroovyCastException e2) {
			// send back 400 if the project ID is other than long format
			response.setStatus(400)
			JSONObject errorMsg = new Utils().resolveException(e2, 400)
			render errorMsg as JSON
		} catch(Exception e3){
			// on any other exception render 500
			response.setStatus(500)
			JSONObject errorMsg = new Utils().resolveException(e3, 500)
			render errorMsg as JSON
		}
	}

	def deleteTerm(){
		try {
			Cytomine cytomine = request['cytomine']

			long sessionID = params.long('sessionID')
			long cmProjectID = params.long('cmProjectID')
			long cmImageID = params.long('cmImageID')
			long cmAnnID = params.long('cmAnnID')
			long cmTermID = params.long('cmTermID')

			cytomine.deleteAnnotationTerm(cmAnnID, cmTermID)

			render new JSONObject().put("message", "The term has been deleted.");

		} catch(CytomineException e1){
			// exceptions from the cytomine java client
			response.setStatus(e1.httpCode)
			JSONObject errorMsg = new Utils().resolveCytomineException(e1)
			render errorMsg as JSON
		} catch(GroovyCastException e2) {
			// send back 400 if the project ID is other than long format
			response.setStatus(400)
			JSONObject errorMsg = new Utils().resolveException(e2, 400)
			render errorMsg as JSON
		} catch(Exception e3){
			// on any other exception render 500
			response.setStatus(500)
			JSONObject errorMsg = new Utils().resolveException(e3, 500)
			render errorMsg as JSON
		}
	}


	def deleteAllTerms(){
		try {
			Cytomine cytomine = request['cytomine']

			long sessionID = params.long('sessionID')
			long cmProjectID = params.long('cmProjectID')
			long cmImageID = params.long('cmImageID')
			long cmAnnID = params.long('cmAnnID')

			// TODO implement deleting all terms by assigning a unique term and deleting it immediately

			render new JSONObject().put("message", "All terms have been deleted.");
		} catch(CytomineException e1){
			// exceptions from the cytomine java client
			response.setStatus(e1.httpCode)
			JSONObject errorMsg = new Utils().resolveCytomineException(e1)
			render errorMsg as JSON
		} catch(GroovyCastException e2) {
			// send back 400 if the project ID is other than long format
			response.setStatus(400)
			JSONObject errorMsg = new Utils().resolveException(e2, 400)
			render errorMsg as JSON
		} catch(Exception e3){
			// on any other exception render 500
			response.setStatus(500)
			JSONObject errorMsg = new Utils().resolveException(e3, 500)
			render errorMsg as JSON
		}
	}

	def getAnnotation3Tuple(){
		try {
			Cytomine cytomine = request['cytomine']

			long sessionID = params.long('sessionID')
			long cmProjectID = params.long('cmProjectID')
			long cmImageID = params.long('cmImageID')
			boolean hideCompleted = params['hideCompleted']==null?false:Boolean.parseBoolean(params['hideCompleted']).booleanValue()

			// get the session and the user
			Session sess = Session.get(sessionID)
			User user = sess.getUser()

			// find the project
			Project p = sess.getCurrentProject()
			long ontologyID = p.getCmOntology()

			// get the currentImage
			Image image = p.getCurrentImage()

			// fetch the terms from the ontology
			TermCollection terms = cytomine.getTermsByOntology(ontologyID)

			Long cmAnnID = null
			try {
				cmAnnID = Long.valueOf(params['currentAnnotation'])
			} catch (NumberFormatException nfe){
				log.warn("Parameter value of 'currentAnnotation' is 'null' or 'undefined', "
						+ "will return first one or two annotations!")
			}

			Map<String,String> filters = new HashMap<String,String>()
			filters.put("project", String.valueOf(cmProjectID))
			filters.put("image", String.valueOf(cmImageID))
			filters.put("showWKT", "true")
			filters.put("showGIS", "true")
			filters.put("showMeta", "true")
			filters.put("showTerm", "true")

			AnnotationCollection annotations = cytomine.getAnnotations(filters)
			// previous call equals cytomine.doGet("/api/annotation.json?project=93519082&image=94255021")

			// if no annotations are available for this image
			if (annotations.isEmpty()){
				String message = ""
				
				// check if the image does exist for the project
				ImageInstance img = cytomine.getImageInstance(cmImageID)
				if (img.getAttr().getAt("project") != cmProjectID){
					message = "The image (ID: " + cmImageID + ") is not available in the selected project."
					log.error(message)
					throw new CytomineException(412, message)
				} 
				
				// otherwise throw another exception
				message = "No annotations found for that query."
				log.error(message)
				throw new CytomineException(404, message)
			}

			// search in the annotations for "114156768" (has predecessor and successor!)
			// "114156782" has no predecessor
			// "94310122" has no successor
			int queryIdx = 0
			int tupleSize = 0
			if (cmAnnID != null){
				queryIdx = annotations.list.indexOf( annotations.list.find { ann -> ann.id == cmAnnID } )
			}

			// if the list does not contain the required annotation id
			// start from the beginning and get the first element
			if (queryIdx == -1){
				queryIdx = 0;
			}

			def currIrisAnn = annotationService.getCurrentAnnotation(annotations, queryIdx, hideCompleted, ontologyID, terms, user, image)
			// update the index (the current annotation may have changed)
			queryIdx = annotations.list.indexOf( annotations.list.find { ann -> ann.id == currIrisAnn.cmID } )
			tupleSize++

			// find the predecessor
			def predIrisAnn = annotationService.getPreviousAnnotation(annotations, queryIdx, hideCompleted, ontologyID, terms, user)
			if (predIrisAnn != null){
				tupleSize++
			}

			// find the successor
			def succIrisAnn = annotationService.getNextAnnotation(annotations, queryIdx, hideCompleted, ontologyID, terms, user)
			if (succIrisAnn != null){
				tupleSize++
			}

			// log the information message
			log.debug("Request: annotation " + currIrisAnn.cmID + " at index [" + queryIdx + "] has " +
					(predIrisAnn==null?"no":"annotation "+predIrisAnn.cmID+" as") + " predecessor, and " +
					(succIrisAnn==null?"no":"annotation "+succIrisAnn.cmID+" as") + " successor.")

			// add annotations to a new JSON object
			JSONObject result = new JSONObject()

			result.put("previousAnnotation", predIrisAnn) // may be null
			result.put("hasPrevious", !(predIrisAnn==null))
			result.put("currentAnnotation", currIrisAnn) // must not be null at this point
			result.put("nextAnnotation", succIrisAnn) // may be null
			result.put("hasNext", !(succIrisAnn==null))
			result.put("size", tupleSize) // number of annotations in the tuple
			result.put("hideCompleted", String.valueOf(hideCompleted))

			result.put("currentIndex", queryIdx)

			// retrieve the user's progress on each image and return it in the object
			JSONObject annInfo = new Utils().getUserProgress(cytomine, cmProjectID, cmImageID, user.getCmID())
			// resolving the values from the JSONObject to each image as property
			result.put("labeledAnnotations", annInfo.get("labeledAnnotations"))
			result.put("userProgress", annInfo.get("userProgress"))
			result.put("numberOfAnnotations", annInfo.get("totalAnnotations"))

			render (result as JSON)

		} catch(CytomineException e1){
			// exceptions from the cytomine java client
			response.setStatus(e1.httpCode)
			JSONObject errorMsg = new Utils().resolveCytomineException(e1)
			render errorMsg as JSON
		} catch(GroovyCastException e2) {
			// send back 400 if the project ID is other than long format
			response.setStatus(400)
			JSONObject errorMsg = new Utils().resolveException(e2, 400)
			render errorMsg as JSON
		} catch(Exception e3){
			// on any other exception render 500
			response.setStatus(500)
			JSONObject errorMsg = new Utils().resolveException(e3, 500)
			render errorMsg as JSON
		}
	}
}
