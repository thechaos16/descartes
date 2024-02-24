import 'package:flutter/material.dart';

import "subpage.dart";

void main() {
  runApp(const Descartes());
}

class Descartes extends StatelessWidget {
  const Descartes({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Descartes',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color.fromARGB(255, 192, 161, 245)),
        useMaterial3: true,
      ),
      home: const MainPage(title: 'Descartes'),
    );
  }
}

class MainPage extends StatefulWidget {
  const MainPage({super.key, required this.title});
  final String title;
  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  bool _clicked = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Container(
        alignment: FractionalOffset.center,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            GestureDetector(
              onTap: () {
                setState(() {
                  print(_clicked);
                  _clicked = !_clicked;
                });                
              },
              child: Container(
                child: Text(
                  _clicked ? 'clicked' : 'Cognito, ergo sum - Rene Descartes',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  )
                ),
              )
            ),
            GestureDetector(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) {
                  return const SubPage(title: "Something to READ!!!");
                }));
              },
              child: Container(
                child: Text(
                  'Something to read'
                )
              )
            ),
            GestureDetector(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) {
                  return const SubPage(title: "Something to THINK!!!");
                }));
              },
              child: Container(
                child: Text(
                  'Something to thinks'
                )
              )
            ),
            GestureDetector(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) {
                  return const SubPage(title: "Something to WRITE!!!");
                }));
              },
              child: Container(
                child: Text(
                  'Something to write'
                )
              )
            ),
          ],
        ),
      ),
    );
  }
}
