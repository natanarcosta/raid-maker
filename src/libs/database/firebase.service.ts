import { Injectable } from '@nestjs/common';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, child, get, set } from 'firebase/database';

export interface MockUserModel {
  name: string;
  email: string;
}

@Injectable()
export class FirebaseService {
  app;
  database;
  firebaseConfig = {
    apiKey: 'AIzaSyBicOYnvIVSG7fhva_EU7HTUP_KKWPDE7c',
    authDomain: 'lao-utils.firebaseapp.com',
    databaseURL: 'https://lao-utils-default-rtdb.firebaseio.com',
    projectId: 'lao-utils',
    storageBucket: 'lao-utils.appspot.com',
    messagingSenderId: '436255728337',
    appId: '1:436255728337:web:4fd9efcdb71f4233635bf0',
    measurementId: 'G-FM91002KBX',
  };

  constructor() {
    this.app = initializeApp(this.firebaseConfig);
    this.database = getDatabase();
  }

  async read() {
    const dbRef = ref(this.database);
    const res = await get(child(dbRef, 'users')).then((snap) => {
      return snap.toJSON();
    });

    return res;
  }

  async getOneById(id: string) {
    const dbRef = ref(this.database);
    const response = await get(child(dbRef, 'users/' + id)).then((res) => {
      const userData = res.val() as MockUserModel;
      console.log(userData);
      return userData.email;
    });

    return { email: response };
  }

  write(data: MockUserModel) {
    const user = {
      id: Math.floor(Math.random() * 100000),
      name: data.name,
      email: data.email,
    };

    const dbRef = ref(this.database, 'users/' + user.id);
    set(dbRef, {
      username: user.name,
      email: user.email,
    });
  }
}
