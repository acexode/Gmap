import { Component, ViewChild, ElementRef } from '@angular/core';
import {Plugins} from '@capacitor/core'
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, observable } from 'rxjs';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { LoadingController, NavController } from '@ionic/angular';
const {Geolocation} = Plugins
declare var google;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  user = null;
  location : Observable<any>
  locationCollection: AngularFirestoreCollection<any>
  @ViewChild('map', {static: false}) mapElement: ElementRef
  map: any;
  markers = [];
  isPickUpRequested: boolean
  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private loading: LoadingController, private nav : NavController ) {
      this.login()
      this.isPickUpRequested = false
  }

  confirmPickup(){
    this.isPickUpRequested = true
    console.log(this.isPickUpRequested)
  }
  cancelPickup(){
    this.isPickUpRequested = false
  }

  ionViewWillEnter(){
    console.log('object'); 
    this.getCurrentLocation()
  }
  loadMap(lat, lng) {    
    let latLng = new google.maps.LatLng( lat, lng); 
    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      options: {
        gestureHandling: 'greedy'
      }
    };
    console.log(this.mapElement.nativeElement);
 
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

  
  login(){
    this.afAuth.auth.signInAnonymously().then(user =>{
      console.log(user);
      this.user = user
      this.locationCollection = this.afs.collection(`location/${this.user.uid}/track`, ref => ref.orderBy('timestamp'))
    })
  }
  async getCurrentLocation(){
    const loading = await this.loading.create({
      message: 'Getting your current Location.....',
      duration: 2000
    });
    await loading.present();
    // let locationObservable = Observable.create(observable =>{      
      Geolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy:true})
      .then(resp =>{
        let lat = resp.coords.latitude
        let lng = resp.coords.longitude
        this.loadMap(lat,lng)
       
        this.loading.dismiss()
        
      }, err =>{
        console.log('Geolocation err: '+ err);
      })
    // })
    // return locationObservable
  }

}
