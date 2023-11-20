<script setup>
import RTE from "./components/RTE.vue";
import LoginComponent from "./components/LoginComponent.vue";
import ProfileView from "./components/ProfileView.vue";
import DocumentSidebar from "./components/DocumentSidebar.vue";
import {onMounted, ref} from "vue";
import {useToast} from "vue-toast-notification";
const show_rte = ref(false);
const show_login = ref(true);
const show_profile_view = ref(false);
const show_document_sidebar = ref(true);
const $toast = useToast();
const logged_in = ref(false);
const rte = ref(null);
const docside = ref(null);
onMounted(() => {
  if (localStorage.getItem("token")) {
    show_login.value = false;
    logged_in.value = true;
    $toast.success("You are logged in as " + localStorage.getItem("user_id"));
  }
});

function logoutuser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  $toast.success("Logged out");
  show_login.value = true;
  logged_in.value = false;
  window.location.reload();
}

function documentSelected(document) {
  $toast.info('Loading document (fast-forward): ' + document.document_title);
  show_rte.value = true;
  rte.value.loadDocument(document);
}
</script>

<template>
  <div class="w-full h-screen bg-slate-900">
    <div class="w-full bg-slate-800 flex justify-between items-center h-100">
      <h1 class="text-3xl p-5 text-white">T4-Documents</h1>
      <div class="text-xl text-white flex justify-center items-center gap-5 mr-5">
        <button @click="show_profile_view = !show_profile_view" class="bg-blue-600 rounded p-2">Profile</button>
        <button v-if="logged_in" @click="logoutuser" class="bg-red-600 rounded p-2">Logout</button>
        <button v-else @click="show_login = !show_login" class="bg-blue-600 rounded p-2">Login/Register</button>
      </div>
    </div>
    <div class="flex w-full h-calc z-10 absolute top-200" v-show="show_document_sidebar">
      <DocumentSidebar @select-document="(document)=> {documentSelected(document)}" @document-autoselect="(documentid) => {this.$refs.rte.loadDocumentById(documentid)}" ref="docside"></DocumentSidebar>
      <div class="h-full w-full flex justify-center items-center">
        <RTE ref="rte" v-show="show_rte" @document-renamed="this.$refs.docside.load();"/>
      </div>
    </div>
  </div>
  <LoginComponent v-if="show_login" @close-login-widget="show_login = false" @user-logged-in="()=> {this.$refs.docside.load(); logged_in = true;}"/>
  <ProfileView v-if="show_profile_view" @close-profile-view="show_profile_view = false" @click="show_profile_view"/>
</template>

<style scoped>

</style>