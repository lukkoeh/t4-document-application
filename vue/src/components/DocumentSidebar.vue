0ß<script setup>
import {ref, defineExpose, defineEmits, onMounted} from "vue";
import axios from "axios";
import {useToast} from "vue-toast-notification";

const documents = ref({});
const newdocname = ref("");
const document_dialog = ref(false);
const share_dialog = ref(false);
const current_share_doc_id = ref(0);
const target_share_id = ref(0);
const $toast = useToast();
defineExpose({load});
const emit = defineEmits(["select-document", "document-autoselect"]);

onMounted(() => {

  // if logged in
  if (localStorage.getItem("token")) {
    load();
  }
});

function load() {
  // request the documents from the server
  // if the user is logged in
  if (localStorage.getItem("token")) {
    // request the documents
    let tempurl = "http://localhost:10001/documents/" + localStorage.getItem("user_id");
    axios({
      method: "get",
      url: tempurl,
      headers: {
        "X-Auth-Token": localStorage.getItem("token")
      }
    }).then((res) => {
      // if response code is 404, the user has no documents, directly create one
      console.log(res.data);
      documents.value = res.data;
      $toast.info("Updated documents list");
    }).catch((err) => {
      if (err.response.status === 404) {
        $toast.info("No documents found, creating one");
        createDocument();
        return;
      }
      console.log(err);
    });
  }
}

function createDocument() {
  // create a new document
  // if the user is logged in
  if (localStorage.getItem("token")) {
    // request the documents
    let tempurl = "http://localhost:10001/document/";
    let formdata = new FormData();
    if (newdocname.value === "") {
      newdocname.value = "Untitled Document";
    }
    formdata.append("title", newdocname.value);
    axios({
      method: "post",
      url: tempurl,
      data: formdata,
      headers: {
        "X-Auth-Token": localStorage.getItem("token")
      }
    }).then((res) => {
      load();
      document_dialog.value = false;
      newdocname.value = "";
      $toast.success("Document created");
      // load the newly created document
      let document_id = res.data.id;
      emit("document-autoselect", document_id);
    }).catch((err) => {
      console.log(err);
    });
  }
}

function removeDocument(id) {
  // remove a document
  // if the user is logged in
  if (localStorage.getItem("token")) {
    // request the documents
    let tempurl = "http://localhost:10001/document/" + id;
    axios({
      method: "delete",
      url: tempurl,
      headers: {
        "X-Auth-Token": localStorage.getItem("token")
      }
    }).then((res) => {
      console.log(res.data);
      $toast.success("Document deleted");
      load();
    }).catch((err) => {
      console.log(err);
    });
  }
  console.log("document id: " + id + " deleted");
}

function shareDocument() {
  // share a document
  // if the user is logged in
  if (localStorage.getItem("token")) {
    // request the documents
    let tempurl = "http://localhost:10001/share/" + current_share_doc_id.value + "/" + target_share_id.value;
    axios({
      method: "post",
      url: tempurl,
      headers: {
        "X-Auth-Token": localStorage.getItem("token")
      }
    }).then((res) => {
      console.log(res.data);
      load();
      share_dialog.value = false;
      target_share_id.value = "";
    }).catch((err) => {
      console.log(err);
    });
  }
}

function changeDocument(doc) {
  emit("select-document", doc);
}
</script>

<template>
  <div class="w-1/5 h-full text-center text-white py-10 flex flex-col gap-5 items-center bg-slate-700">
    <h1 class="text-xl mb-5 bg-slate-900 w-4/5 p-5 rounded">Your Documents</h1>
    <div class="overflow-y-scroll h-4/5 w-full flex flex-col items-center gap-5 scrollbar-hide">
      <div @click="changeDocument(document)" v-for="document in documents" :key="document.document_id" class="w-4/5 bg-slate-900 rounded flex flex-col gap-2 p-5">
        <p>{{ document.document_title }}</p>
        <p>{{ document.document_created }}</p>
        <div class="w-full flex justify-center gap-2 relative h-1/3">
          <button :docid="document.document_id" @click="removeDocument(document.document_id)" class="bg-red-600 rounded p-1 w-full h-full">Delete</button>
          <button :docid="document.document_id" @click="share_dialog = true; current_share_doc_id = document.document_id;" class="bg-blue-600 rounded p-1 w-full h-full">Share</button>
        </div>
      </div>
    </div>
    <button @click="load" class="bg-yellow-600 p-2 w-4/5 rounded">Refresh</button>
    <button @click="document_dialog = true" class="bg-blue-600 p-2 w-4/5 rounded">Create</button>
  </div>
  <div v-if="document_dialog" class="fixed left-0 top-0 w-full h-full flex items-center justify-center z-10 bg-black opacity-70">
    <div class="bg-slate-700 w-1/2 h-1/3 p-5 flex flex-col justify-center gap-5 opacity-100 rounded">
      <h2 class="text-white text-2xl">Create a new document</h2>
      <input class="p-3 text-white bg-slate-800 w-full" v-model="newdocname" placeholder="New Document name"/>
      <div class="flex justify-between">
        <button @click="document_dialog = false" class="w-1/3 bg-blue-600 text-white p-3 rounded">Cancel</button>
        <button @click="createDocument" class="w-1/3 bg-blue-600 text-white p-3 rounded">Create</button>
      </div>
    </div>
  </div>
  <div v-if="share_dialog" class="fixed left-0 top-0 w-full h-full flex items-center justify-center z-40 bg-black opacity-70">
    <div class="bg-slate-700 w-1/2 h-1/3 p-5 flex flex-col justify-center gap-5 opacity-100 rounded">
      <h2 class="text-white text-3xl">Share this Document: {{ current_share_doc_id }}</h2>
      <p class="text-white">Tip: People can find their share ID in their Profile View.</p>
      <input class="p-3 text-white bg-slate-800 w-full" v-model="target_share_id" placeholder="Target Share ID"/>
      <div class="flex justify-between">
        <button @click="share_dialog = false" class="w-1/3 bg-blue-600 text-white p-3 rounded">Cancel</button>
        <button @click="shareDocument" class="w-1/3 bg-blue-600 text-white p-3 rounded">Share</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>