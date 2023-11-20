<script setup>
import {ref, defineExpose, defineEmits, onMounted} from "vue";
import axios from "axios";
import {Delta} from "@vueup/vue-quill";
import {useToast} from "vue-toast-notification";

const emit = defineEmits(["document-renamed"]);
const current_document = ref(0);
const current_document_title = ref("Test");
const quilleditor = ref(null);
const socket_connection = ref(null);
const $toast = useToast();
const rename_mode = ref(false);
const debug_mode = ref(false);
defineExpose({loadDocument, loadDocumentById});
onMounted(() => {
})

function editorReady() {
  quilleditor.value.setContents(new Delta(), "api");
  socket_connection.value = new WebSocket("ws://localhost:10002");
  socket_connection.value.onmessage = (event) => {
    // parse the message into JSON
    let message = "";
    try {
      message = JSON.parse(event.data);
    } catch (e) {
      $toast.error("Received an answer that is not json");
      return;
    }
    // check the
    if (message.code === 200 && message.action === "information" && debug_mode.value === true) {
      $toast.info("Socket responded with success string");
    } else if (message.code === 200) {
      // merge the delta of the editor (full) with the received delta
      let fulldelta = quilleditor.value.getContents();
      let newdelta = fulldelta.compose(new Delta(message.payload));
      quilleditor.value.setContents(newdelta, "api");
    } else {
      $toast.error("Received invalid answer");
    }
  }
  socket_connection.value.onopen = () => {
    $toast.info("Socket connection established");
    console.log("opened");
    // create json with document_selection with documentid and the token
  }
  socket_connection.value.onclose = () => {
    $toast.info("Socket connection was closed");
  }
  socket_connection.value.onerror = () => {
    $toast.error("Socket connection error");
    console.log("error")
  }
}

function resetQuill() {
  console.log("trying to reset")
  quilleditor.value.setContents(new Delta(), "api");
}

function loadDocument(doc) {
  //load the document and integrate all existing deltas from the db into the editor
  resetQuill();
  current_document.value = doc.document_id;
  current_document_title.value = doc.document_title;
  let data = JSON.stringify({
    token: localStorage.getItem("token"),
    document_selection: current_document.value
  });
  // send the json to the socket
  socket_connection.value.send(data);
  if (debug_mode.value === true) {
    $toast.success("Document selected for live session")
  }
  let tempurl = "http://localhost:10001/deltas/" + doc.document_id;
  axios({
    method: "get",
    url: tempurl,
    headers: {
      "X-Auth-Token": localStorage.getItem("token")
    }
  }).then((res) => {
    // if there are no deltas, just use a blank editor
    if (res.status === 404) {
      console.log("no deltas");
    }
    let deltas = res.data;
    let newdelta = new Delta();
    // apply the deltas to the newdelta
    for (let i = 0; i < deltas.length; i++) {
      newdelta = newdelta.compose(new Delta(JSON.parse(deltas[i].delta_content)));
    }
    console.log(newdelta);
    // set the editor contents to the newdelta
    quilleditor.value.setContents(newdelta, "api");
    $toast.success("Document loaded");
  }).catch((err) => {
    if (err.response.status === 404) {
      console.log("There are probably no deltas, so just use a blank editor");
    } else {
      console.log(err);
      $toast.error("Something went wrong while loading the document");
    }
  });
}

function loadDocumentById(id) {
  // fetch the document by id
  let tempurl = "http://localhost:10001/document/" + id;
  axios({
    method: "get",
    url: tempurl,
    headers: {
      "X-Auth-Token": localStorage.getItem("token")
    }
  }).then((res) => {
    console.log(res.data);
    let document = res.data;
    loadDocument(document);
  }).catch((err) => {
    console.log(err);
  });
}

function editorChanged(delta) {
  // handles change in the quill editor
  // check if the delta source is api
  if (delta.source === "api") {
    return;
  }
  let data = JSON.stringify({
    token: localStorage.getItem("token"),
    document_id: current_document.value,
    payload: delta.delta
  });
  socket_connection.value.send(data);
}

function handleRename() {
  rename_mode.value = !rename_mode.value;
  if (!rename_mode.value) {
    let tempurl = "http://localhost:10001/document/" + current_document.value;
    axios({
      method: "patch",
      url: tempurl,
      data: {
        title: current_document_title.value
      },
      headers: {
        "X-Auth-Token": localStorage.getItem("token")
      }
    }).then((res) => {
      console.log(res.data);
      $toast.success("Document renamed");
      emit("document-renamed");
    }).catch((err) => {
      console.log(err);
    });
  }
}
</script>

<template>
  <div class="flex flex-col w-full h-full text-white">
    <div class="flex justify-start items-center gap-5">
      <input class="text-2xl m-5 w-1/2 bg-slate-700 rounded p-2" :placeholder="current_document_title" v-model="current_document_title" v-if="rename_mode"/>
      <h2 v-else class="text-3xl m-5">Edit: {{ current_document_title }}</h2>
      <button class="bg-blue-600 rounded p-2" @click="handleRename">Rename</button>
    </div>
    <QuillEditor @ready="editorReady" ref="quilleditor" @textChange="(delta)=> {editorChanged(delta)}"></QuillEditor>
  </div>
</template>

<style scoped>

</style>