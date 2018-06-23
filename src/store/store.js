import Vue from 'vue';
import Vuex from 'vuex';
import firebase from 'firebase/app';
import router from '@/router';

Vue.use(Vuex);

export const store = new Vuex.Store({
    state:{
        confirmDialog:{
            isVisible:false,
            resultTrueFunction:function(){alert('true');return true;},
            resultFalseFunction:function(){alert('false');return false;},
        },
        user:null,
        userIsAuthenticated:false,
        QUERY_PrimaryRelativeCaregiverById:false,
        currentPrimaryRelativeCaregiver:null,
        currentPrimaryRelativeCaregivers:false,

    },
    mutations:{
        setConfirmDialogByObject(state, confirmDialogProperties){
            for (var key in confirmDialogProperties) {
                if (confirmDialogProperties.hasOwnProperty(key)) {
                    state.confirmDialog[key] = confirmDialogProperties[key];
                }
            }
        },
        setUserIsAuthenticated(state, replace){
            state.userIsAuthenticated = replace;
        },
        setUser(state, replace){
            state.user = replace;
        },
        initialize_currentPrimaryRelativeCaregiver(state, PrimaryRelativeCaregiver){
            state.currentPrimaryRelativeCaregiver = PrimaryRelativeCaregiver;
        },
        update_currentPrimaryRelativeCaregiver_byObject(state, dataProperty){
            for (var key in dataProperty) {
                if (dataProperty.hasOwnProperty(key)) {
                    state.currentPrimaryRelativeCaregiver.data[key] = dataProperty[key];
                }
            }
        },
    },
    actions:{
        login(context, credentials){
            firebase.auth().signInWithEmailAndPassword(credentials.username, credentials.password)
            .then(data=>{
                console.log('Logged in.');
                router.push('/dashboard');
            })
            .catch(e=>{
                console.log('Login failed: ', e);
                alert(e.message)
            });  
        },
        logout(context){
            firebase.auth().signOut()
            .then(data=>{
              console.log('Logged out.');
              router.push('/login');
            })
            .catch(e=>{
              console.log('Logout failed: ', e);
            });
        },
        // Retrieve data from firebase
        getPrimaryRelativeCaregiverById(context, PrimaryRelativeCaregiverId){
            // If there is already a listener for this query, unsubscribe it
            if(context.state.QUERY_PrimaryRelativeCaregiverById){
                context.state.QUERY_PrimaryRelativeCaregiverById();
            }
            // Create New
            if(PrimaryRelativeCaregiverId == "add"){
                context.commit('initialize_currentPrimaryRelativeCaregiver', null);
                context.dispatch('fcommit_PrimaryRelativeCaregiverById');
            }
            // Get existing
            else{
                // Set up the new query & listener
                context.state.QUERY_PrimaryRelativeCaregiverById = firebase.firestore().collection('PrimaryRelativeCaregiver').doc(PrimaryRelativeCaregiverId).onSnapshot(function(doc){
                    if(!doc.exists){
                        context.commit('initialize_currentPrimaryRelativeCaregiver', null);
                    }
                    // Only update if receiving new data from the firebase server. 
                    // - commits to firebase from our app will also call this listener and we can ignore since its just putting the data back where it came from
                    else if(!doc.metadata.hasPendingWrites){
                        context.commit('initialize_currentPrimaryRelativeCaregiver', {
                            id: PrimaryRelativeCaregiverId,
                            data: doc.data(),
                        })
                    }
                });            
            }
        },
        // Commit changes to firebase
        fcommit_PrimaryRelativeCaregiverById(context){
            // Updating an entry
            if(context.state.currentPrimaryRelativeCaregiver && context.state.currentPrimaryRelativeCaregiver.hasOwnProperty('id') && context.state.currentPrimaryRelativeCaregiver.id){
                firebase.firestore().collection('PrimaryRelativeCaregiver').doc(context.state.currentPrimaryRelativeCaregiver.id).update(context.state.currentPrimaryRelativeCaregiver.data)
                .then(function() {
                    //console.log("Document successfully written!");
                })
                .catch(function(error) {
                    console.error("Error writing document: ", error);
                });    
            }
            // Creating a new entry
            else{
                console.log('creating new');
                firebase.firestore().collection('PrimaryRelativeCaregiver').add({})
                .then(function(docRef) {
                    context.dispatch('getPrimaryRelativeCaregiverById', docRef.id);
                    router.replace('/client/' + docRef.id);               
                })
                .catch(function(error) {
                    console.error("Error writing document: ", error);
                });    
            }
        },
        // Delete Client
        fdelete_PrimaryRelativeCaregiverById(context){
            context.commit('setConfirmDialogByObject', {
                isVisible:true,
                //resultTrueFunction:context=>{console.log('resultTrueFunction');context.commit('setConfirmDialogByObject',{isVisible:false})},
                //resultFalseFunction:context=>{console.log('resultFalseFunction');context.commit('setConfirmDialogByObject',{isVisible:false})},
            });
            console.log(context);
            context.state.confirmDialog.resultTrueFunction=function(context){context.state.confirmDialog.isVisible=false;};
            context.state.confirmDialog.resultFalseFunction=function(context){context.state.confirmDialog.isVisible=false;};

            return false;
            firebase.firestore().collection('PrimaryRelativeCaregiver').doc(context.state.currentPrimaryRelativeCaregiver.id).delete()
                .then(function(docRef) {
                    router.replace('/dashboard');               
                })
                .catch(function(error) {
                    console.error("Error deleting document: ", error);
                }); 
        },

        getPrimaryRelativeCaregivers(context){
            firebase.firestore().collection('PrimaryRelativeCaregiver').get()
            .then(function(querySnapshot){
                let PrimaryRelativeCaregiverOBJ = {};
                querySnapshot.forEach(function(doc){
                    PrimaryRelativeCaregiverOBJ[doc.id] = doc.data();
                });
                context.state.currentPrimaryRelativeCaregivers=PrimaryRelativeCaregiverOBJ;
            })
            .catch(function(error) {
                console.error("Error retrieving clients: ", error);
            });
        }
    }
})