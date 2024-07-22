
import 'package:flutter/material.dart';

import "db.dart";
import 'constants.dart';


class UriRegisterPage extends StatelessWidget {
  const UriRegisterPage({Key? key, required this.title}) : super(key: key);
  final String title;

  @override
  Widget build(BuildContext context) {
    var _controller = TextEditingController();
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Color.fromARGB(246, 179, 241, 192),
        title: Text(title),
      ),
      body: Container(
        alignment: FractionalOffset.center,
        child: Column(
          children: <Widget>[
            TextField(
              controller: _controller,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                hintText: 'Enter a url',
              ),
              textInputAction: TextInputAction.go,
              onSubmitted: (value) {
                insertRecord(dbName, value);
                _controller.clear();
              },
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('Go back'),
            ),
          ],
        )
      ),
    );
  }
}