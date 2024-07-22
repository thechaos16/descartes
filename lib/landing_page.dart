
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';


class LandingPage extends StatelessWidget {
  const LandingPage({Key? key, required this.uri}) : super(key: key);
  final String uri;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Color.fromARGB(246, 179, 241, 192),
        title: Text('Landing!'),
      ),
      body: Container(
        alignment: FractionalOffset.center,
        child: Column(
          children: <Widget>[
            TextButton(
              onPressed: () {
                Uri url = Uri.parse(uri);
                print(url);
                _launchURL(url);
              },
              child: const Text('Click to redirect'),
            ),
          ],
        )
      ),
    );
  }

  void _launchURL(Uri url) async {
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    } else {
      throw 'Could not launch $url';
    }
  }
}