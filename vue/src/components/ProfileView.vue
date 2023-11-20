<script setup>
import {computed, onMounted, ref, defineEmits} from "vue";
import axios from "axios";
import {useToast} from "vue-toast-notification";

const $toast = useToast();
defineEmits(["close-profile-view"]);
const firstname = ref("");
const lastname = ref("");
const email = ref("");

const editmode = ref(false);
const editop = computed(()=> {
  return editmode.value ? "Save" : "Edit";
})

const passwordchange = ref(false);
const old_pw = ref("");
const new_pw = ref("");
const new_pw_confirm = ref("");
const user_id = ref(localStorage.getItem("user_id"));
const u_sure = ref(false);
const deletemode_button = computed(()=> {
  return u_sure.value ? "DO IT NOW" : "Delete Account";
})

onMounted(()=>{
  console.log("mounted")
  if (!localStorage.getItem("token")) {
    console.log("no token found")
    return;
  }
  let tempurl = "http://localhost:10001/user/" + localStorage.getItem("user_id");
  axios({
    method: "get",
    url: tempurl,
    headers: {
      "X-Auth-Token": localStorage.getItem("token")
    }
  }).then((res) => {
    console.log(res.data);
    let userdata = res.data.data;
    firstname.value = userdata.user_firstname;
    lastname.value = userdata.user_lastname;
    email.value = userdata.user_email;
    $toast.info("Loaded user data");
  }).catch((err) => {
    console.log(err);
  });
})

function save() {
  console.log("save")
  if (!localStorage.getItem("token")) {
    return;
  }
  let tempurl = "http://localhost:10001/user/" + localStorage.getItem("user_id");
  axios({
    method: "patch",
    url: tempurl,
    data: {
      firstname: firstname.value,
      lastname: lastname.value,
      email: email.value
    },
    headers: {
      "X-Auth-Token": localStorage.getItem("token")
    }
  }).then((res) => {
    console.log(res.data);
    $toast.success("Saved user data");
  }).catch((err) => {
    console.log(err);
  });
}

function updatePassword() {
  console.log("update password")
  if (!localStorage.getItem("token")) {
    return;
  }
  if (new_pw.value !== new_pw_confirm.value) {
    $toast.error("New passwords do not match");
    return;
  }
  let tempurl = "http://localhost:10001/auth/password/" + localStorage.getItem("user_id");
  axios({
    method: "patch",
    url: tempurl,
    headers: {
      "X-Auth-Token": localStorage.getItem("token")
    },
    data: {
      old_password: old_pw.value,
      new_password: new_pw.value
    },
  }).then((res) => {
    console.log(res.data);
    passwordchange.value = false;
    $toast.success("Password updated");
  }).catch((err) => {
    // if 401, toast error that old pw is incorrect
    if (err.response.status === 400) {
      $toast.error("Old password is incorrect");
      return;
    }
    else {
      $toast.error("Something went wrong");
      console.log(err);
      return;
    }
  });
}

function handleAccountDeletion() {
  u_sure.value = !u_sure.value;
  if (u_sure.value) {
    return;
  }else {
    let tempurl = "http://localhost:10001/user/" + localStorage.getItem("user_id");
    axios({
      method: "delete",
      url: tempurl,
      headers: {
        "X-Auth-Token": localStorage.getItem("token")
      }
    }).then((res) => {
      console.log(res.data);
      $toast.success("Account deleted");
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      window.location.reload();
    }).catch((err) => {
      console.log(err);
    });
  }
}
</script>

<template>
  <div class="flex w-screen h-screen justify-center items-center fixed left-0 top-0 z-40">
    <div v-if="passwordchange" class="w-2/3 h-2/3 bg-slate-900 p-10 text-white relative rounded">
      <h2 class="text-3xl text-white mb-5">Change Password</h2>
      <div class="flex flex-col gap-5">
        <input class="p-3 text-white bg-slate-700 w-full" v-model="old_pw" placeholder="Old password"/>
        <input class="p-3 text-white bg-slate-700 w-full" type="password" v-model="new_pw" placeholder="New password" :class="pw_match"/>
        <input class="p-3 text-white bg-slate-700 w-full" type="password" v-model="new_pw_confirm" placeholder="Confirm new password" :class="pw_match"/>
      </div>
      <div class="absolute bottom-5 right-5 flex justify-between gap-5 w-1/3">
        <button @click="passwordchange = !passwordchange" class="bg-blue-600 p-3 rounded w-full">Cancel</button>
        <button @click="updatePassword" class="bg-blue-600 p-3 rounded w-full">Update password</button>
      </div>
    </div>
    <div v-else class="w-2/3 h-2/3 bg-slate-800 p-10 text-white relative rounded">
      <h2 class="text-3xl text-white mb-5">Profile</h2>
      <div v-if="editmode" class="flex flex-col gap-5">
        <input class="p-3 text-white bg-slate-700 w-full" v-model="firstname" placeholder="First name"/>
        <input class="p-3 text-white bg-slate-700 w-full" v-model="lastname" placeholder="Last name"/>
        <input class="p-3 text-white bg-slate-700 w-full" v-model="email" placeholder="E-Mail"/>
      </div>
      <div v-else class="flex flex-col gap-5">
        <p class="p-3 text-white bg-slate-700 w-full">First name: {{firstname}}</p>
        <p class="p-3 text-white bg-slate-700 w-full">Last name: {{lastname}}</p>
        <p class="p-3 text-white bg-slate-700 w-full">E-Mail: {{email}}</p>
        <p class="p-3 text-white bg-slate-700 w-full">Your Share-ID: {{user_id}}</p>
        <p class="text-white w-full">Tip: Use this Share-ID to get Documents from other Users</p>
      </div>
      <div class="flex absolute right-5 bottom-5 gap-5 justify-between w-1/4">
        <button @click="()=> {if (editmode) {save();}editmode = !editmode; }" class="bg-blue-600 p-3 rounded w-full">{{ editop }}</button>
        <button @click="this.$emit('close-profile-view')" class="bg-blue-600 p-3 rounded w-full">Close</button>
      </div>
      <div class="flex absolute left-5 bottom-5 gap-5 justify-between w-1/3">
        <button class="bg-red-600 p-3 rounded w-full" @click="handleAccountDeletion">{{ deletemode_button }}</button>
        <button @click="passwordchange = !passwordchange" class="bg-red-600 p-3 rounded w-full">Update Password</button>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>