from flask import Flask, request, jsonify,Response,make_response
from flask_cors import CORS
from sklearn.linear_model import LinearRegression
import numpy as np
app = Flask(__name__)
CORS(app)
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

class locationClass:
    def __init__(self):
        self.totalentries=0
        self.averageExtraPrice=0
        self.isMlModelApplicable=0
        self.mlModel=LinearRegression()
    def fit(self,val,className):
        self.totalentries+=1
        additional=(val.get("additional")+self.averageExtraPrice*(self.totalentries-1))/(self.totalentries)
        self.averageExtraPrice=additional
        if self.totalentries>=2:
            self.isMlModelApplicable=1
            uri = "mongodb+srv://pbshayar:kayar@cluster0.0jztak4.mongodb.net/?retryWrites=true&w=majority"
            client = MongoClient(uri, server_api=ServerApi('1'))
            try:
                client.admin.command('ping')
                print("Pinged your deployment. You successfully connected to MongoDB!")
            except Exception as e:
                print(e)
            db = client["test"]
            collection = db["prices"]
            cursor = collection.find({
                "state":val.get("location"),
                "productName":className
            })
            x=[]
            y=[]
            for data in cursor:
                price=data.get('shownPrice')
                additionalPrice=data.get('additionalCost')
                x.append([price])
                y.append(additionalPrice)
            self.mlModel.fit(x,y)

    def predict(self,val):
        mlAns="currently,the count is less than required for ml model"
        if self.isMlModelApplicable==1:
            x=[[val.get("shownPrice")]]
            mlAns=self.mlModel.predict(x)
            print(mlAns)
            mlAnswer=mlAns[0]
            print(mlAnswer)
            mlAnswer=round(mlAnswer,2)
        return ({"avg":self.averageExtraPrice,
                        "mlAns":mlAnswer
                        })

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
        self.generalTotalEntries += 1
        additional = (val.get("additional") + self.generalAverageExtraPrice * (self.generalTotalEntries - 1)) / (self.generalTotalEntries)
        self.averageExtraPrice = additional
        location=val.get("location")
        locationModel = className + location
        locationModel=locationModel.replace(" ", "")
        model=self.locationWiseModel.get(locationModel)
        if model is None:
            self.locationWiseModel[locationModel] = locationClass()
            self.locationWiseModel[locationModel].fit(val,className)
        else:
            model.fit(val,className)

    def predict(self,val,className):
        location = val.get("location")
        locationModel = className + location
        locationModel=locationModel.replace(" ", "")
        model = self.locationWiseModel.get(locationModel)
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
            "err":1,
            "answer":"no one has yet added price for this model"
        })
    else:
        ans=model.predict(val,data_key)
        print(ans)
        return make_response(jsonify({
            "err":0,
            "answer": ans
        }))

if __name__ == '__main__':
    uri = "mongodb+srv://pbshayar:kayar@cluster0.0jztak4.mongodb.net/?retryWrites=true&w=majority"
    client = MongoClient(uri, server_api=ServerApi('1'))
    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)
    db=client["test"]
    collection=db["prices"]
    cursor=collection.find()
    for data in cursor:
        data_key = data.get('productName')
        val = {
            "additional":data.get('additionalCost'),
            "location":data.get('state')
        }
        model = modelObject.get(data_key)
        if model is None:
            cnt = cnt + 1
            modelObject[data_key] = LinearRegressionModels()
            modelObject[data_key].fit(val, data_key)
        else:
            model.fit(val, data_key)
    app.run(debug=True, port=7000)
