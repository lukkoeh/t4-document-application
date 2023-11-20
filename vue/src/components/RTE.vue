<script setup>
import {ref, defineExpose, onMounted} from "vue";
import axios from "axios";
import {Delta} from "@vueup/vue-quill";
import {useToast} from "vue-toast-notification";

const current_document = ref(0);
const current_document_title = ref("Test");
const quilleditor = ref(null);
const token = ref(localStorage.getItem("token"));
const user_id = ref(localStorage.getItem("user_id"));
const socket_connection = ref(null);
const $toast = useToast();
defineExpose({loadDocument});
onMounted(()=> {
  console.log("RTE Mounted")
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
    if (message.code === 200 && message.action === "information") {
      $toast.info("Socket responded with success string");
    } else if (message.code === 200) {
      console.warn("merging");
      // merge the delta of the editor (full) with the received delta
      let fulldelta = quilleditor.value.getContents();
      let newdelta = fulldelta.compose(new Delta(message.payload));
      console.log("New Delta: " + newdelta);
      quilleditor.value.setContents(newdelta, "api");
    }
    else {
      $toast.error("Received invalid answer");
    }
    console.log(message)
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
  console.log(doc);
  console.log(user_id.value);
  current_document.value = doc.document_id;
  current_document_title.value = doc.document_title;
  let data = JSON.stringify({
    token: localStorage.getItem("token"),
    document_selection: current_document.value
  });
  console.log(data)
  // send the json to the socket
  socket_connection.value.send(data);
  $toast.success("Document selected for live session")
  let tempurl = "http://localhost:10001/deltas/" + doc.document_id;
  axios({
    method: "get",
    url: tempurl,
    headers: {
      "X-Auth-Token": localStorage.getItem("token")
    }
  }).then((res) => {
    // if there are no deltas, just use a blank editor
    if (res.data.length === 0) {
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
  }).catch(() => {
    console.log("error");
  });
}

function editorChanged(delta) {
  // handles change in the quill editor
  // check if the delta source is api
  if (delta.source === "api") {
    return;
  }
  let data = JSON.stringify({
    token: token.value,
    document_id: current_document.value,
    payload: delta.delta
  });
  console.log(data)
  socket_connection.value.send(data);
}
</script>

<template>
  <div class="flex flex-col w-full h-full text-white">
    <h1 class="text-3xl m-5">Editing Document: {{ current_document_title }}</h1>
    <QuillEditor @ready="editorReady" ref="quilleditor" @textChange="(delta)=> {editorChanged(delta)}"></QuillEditor>
  </div>
</template>

<style scoped>

</style>