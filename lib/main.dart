import 'package:flutter/material.dart';

import 'uri_register_page.dart';
import 'db_viewer.dart';
import 'landing_page.dart';

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
                  'Cognito, ergo sum\n',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 30,
                  ),
                  textAlign: TextAlign.center,
                ),
              )
            ),
            GestureDetector(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) {
                  return const UriRegisterPage(title: "Register new URI");
                }));
              },
              child: Container(
                child: Text(
                  'Register new URI',
                  style: TextStyle(
                    fontSize: 22,
                  )
                ),
              )
            ),
            GestureDetector(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) {
                  return const DBViewPage(title: "DATABASE!");
                }));
              },
              child: Container(
                child: Text(
                  'View database',
                  style: TextStyle(
                    fontSize: 22,
                  ),
                )
              )
            ),
            GestureDetector(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) {
                  return const LandingPage(uri: "https://naver.com");
                }));
              },
              child: Container(
                child: Text(
                  'Push landed page',
                  style: TextStyle(
                    fontSize: 22,
                  ),
                )
              )
            ),
          ],
        ),
      ),
    );
  }
}
