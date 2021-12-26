import firebase from './FirebaseConfig';
import {
  addDoc,
  doc,
  getDoc,
  collection as firestoreCollection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  updateDoc,
  deleteDoc
} from 'firebase/firestore/lite';

const firestore = firebase.firestore;

const createDocument = (collection, document) => {
  return addDoc(firestoreCollection(firestore, collection), document);
  // return firestore.collection(collection).add(document);
};

const readDocument = (collection, id) => {
  return getDoc(doc(firestoreCollection(firestore, collection)), id);
  // return firestore.collection(collection).doc(id).get();
};

const readDocuments = async ({
  collection,
  queries,
  orderByField,
  orderByDirection,
  perPage,
  cursorId
}) => {
  const collectionRef = firestoreCollection(firestore, collection);

  // let collectionRef = firestore.collection(collection);

  const queryConstraint = [];

  if (queries && queries.length > 0) {
    for (const query of queries) {
      // collectionRef = collectionRef.where(
      //   query.field,
      //   query.condition,
      //   query.value
      // );
      queryConstraint.push(where(query.field, query.condition, query.value));
    }
  }

  if (orderByField && orderByDirection) {
    // collectionRef = collectionRef.orderBy(orderByField, orderByDirection);

    queryConstraint.push(orderBy(orderByField, orderByDirection));
  }

  if (perPage) {
    // collectionRef = collectionRef.limit(perPage);
    queryConstraint.push(limit(perPage));
  }

  if (cursorId) {
    const document = await readDocument(collection, cursorId);
    // collectionRef = collectionRef.startAfter(document);

    queryConstraint.push(startAfter(document));
  }

  const firestoreQuery = query(collectionRef, ...queryConstraint);

  // return collectionRef.get();
  return getDocs(firestoreQuery);
};

const updateDocument = (collection, id, document) => {
  // return firestore.collection(collection).doc(id).update(document);
  return updateDoc(
    doc(firestoreCollection(firestore, collection), id),
    document
  );
};

const deleteDocument = (collection, id) => {
  // return firestore.collection(collection).doc(id).delete();
  return deleteDoc(doc(firestoreCollection(firestore, collection), id));
};

const FirebaseFirestoreService = {
  createDocument,
  readDocuments,
  updateDocument,
  deleteDocument
};

export default FirebaseFirestoreService;
