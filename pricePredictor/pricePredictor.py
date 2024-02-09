from flask import Flask, request, jsonify,Response
from flask_cors import CORS
from sklearn.linear_model import LinearRegression
import numpy as np
app = Flask(__name__)
CORS(app)
import pymongo

class locationClass:
    def __init__(self):
        self.totalentries=0
        self.averageExtraPrice=0
    def fit(self,val):
        self.totalentries+=1
        additional=(val.get("additional")+self.averageExtraPrice*(self.totalentries-1))/(self.totalentries)
        self.averageExtraPrice=additional
    def predict(self,val):
        return self.averageExtraPrice

class LinearRegressionModels:
    def __init__(self):
        self.locationWiseModel={}
        self.generalAverageExtraPrice=0
        self.generalTotalEntries=0
    # uri = "mongodb+srv://ishan23oberoi:assdafgsasd@cluster0.0jztak4.mongodb.net/?retryWrites=true&w=majority";
    # client = pymongo.MongoClient(uri)
    # mydb = client["DarkBuster"]
    # mycol = mydb["test.prices"]
    def fit(self,val, className):
        print(val)
        self.generalTotalEntries += 1
        additional = (val.get("additional") + self.generalAverageExtraPrice * (self.generalTotalEntries - 1)) / (self.generalTotalEntries)
        self.averageExtraPrice = additional
        location=val.get("location")
        locationModel = className + location
        locationModel=locationModel.replace(" ", "")
        print(locationModel)
        model=self.locationWiseModel.get(locationModel)
        if model is None:
            self.locationWiseModel[locationModel] = locationClass()
            self.locationWiseModel[locationModel].fit(val)
        else:
            model.fit(val)

    def predict(self,val,className):
        location = val.get("location")
        locationModel = className + location
        locationModel=locationModel.replace(" ", "")
        print(locationModel)
        print(len(self.locationWiseModel))
        model = self.locationWiseModel.get(locationModel)
        for key, value in self.locationWiseModel.items():
            print(key, value)
        if model is None:
            return "no one has added additional cost for this location.You can choose general section in location"
        else:
            return model.predict(val)

modelObject={}
cnt=0
@app.route('/insert', methods=['POST'])
def insert():
    global cnt
    data = request.json
    data_key = data.get('data_key')
    val=data.get('value')
    model = modelObject.get(data_key)
    if model is None:
        cnt=cnt+1
        modelObject[data_key]=LinearRegressionModels()
        modelObject[data_key].fit(val,data_key)
    else:
        model.fit(val,data_key)
    return Response(status=200)
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    data_key = data.get('data_key')
    data_key=data_key.replace(" ","")
    val=data.get('value')
    model = modelObject.get(data_key)
    if model is None:
        return jsonify({
            "answer":"no one has yet added price for this model"
        })
    else:
        ans=model.predict(val,data_key)
        return jsonify({
            "answer": ans
        })

if __name__ == '__main__':
    app.run(debug=True, port=7000)
