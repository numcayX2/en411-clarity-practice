export interface WordTiming {
  start: number;
  end: number;
  audioStart: number;
  audioEnd: number;
}

export interface ParagraphTiming {
  paragraphId: number;
  words: WordTiming[];
}

export interface AudioPassageConfig {
  audioSrc: string;
  duration: number;
  paragraphs: ParagraphTiming[];
}

export const MARIE_CURIE_AUDIO: AudioPassageConfig = {
  "audioSrc": "/audio/marie-curie.mp3",
  "duration": 95.6,
  "paragraphs": [
    {
      "paragraphId": 1,
      "words": [
        {
          "start": 0,
          "end": 5,
          "audioStart": 0.0,
          "audioEnd": 0.26
        },
        {
          "start": 6,
          "end": 11,
          "audioStart": 0.26,
          "audioEnd": 0.72
        },
        {
          "start": 12,
          "end": 14,
          "audioStart": 0.72,
          "audioEnd": 0.86
        },
        {
          "start": 15,
          "end": 18,
          "audioStart": 0.86,
          "audioEnd": 1.02
        },
        {
          "start": 19,
          "end": 21,
          "audioStart": 1.02,
          "audioEnd": 1.08
        },
        {
          "start": 22,
          "end": 25,
          "audioStart": 1.08,
          "audioEnd": 1.18
        },
        {
          "start": 26,
          "end": 30,
          "audioStart": 1.18,
          "audioEnd": 1.46
        },
        {
          "start": 31,
          "end": 37,
          "audioStart": 1.46,
          "audioEnd": 1.86
        },
        {
          "start": 38,
          "end": 43,
          "audioStart": 1.86,
          "audioEnd": 2.22
        },
        {
          "start": 44,
          "end": 54,
          "audioStart": 2.22,
          "audioEnd": 2.8
        },
        {
          "start": 55,
          "end": 57,
          "audioStart": 2.8,
          "audioEnd": 3.14
        },
        {
          "start": 58,
          "end": 65,
          "audioStart": 3.14,
          "audioEnd": 3.64
        },
        {
          "start": 67,
          "end": 70,
          "audioStart": 3.92,
          "audioEnd": 4.04
        },
        {
          "start": 71,
          "end": 74,
          "audioStart": 4.04,
          "audioEnd": 4.18
        },
        {
          "start": 75,
          "end": 79,
          "audioStart": 4.18,
          "audioEnd": 4.5
        },
        {
          "start": 80,
          "end": 85,
          "audioStart": 4.5,
          "audioEnd": 4.92
        },
        {
          "start": 86,
          "end": 96,
          "audioStart": 4.92,
          "audioEnd": 5.62
        },
        {
          "start": 97,
          "end": 99,
          "audioStart": 5.62,
          "audioEnd": 5.82
        },
        {
          "start": 100,
          "end": 106,
          "audioStart": 5.82,
          "audioEnd": 6.18
        },
        {
          "start": 107,
          "end": 109,
          "audioStart": 6.18,
          "audioEnd": 6.36
        },
        {
          "start": 110,
          "end": 114,
          "audioStart": 6.36,
          "audioEnd": 7.4
        },
        {
          "start": 116,
          "end": 119,
          "audioStart": 7.82,
          "audioEnd": 7.94
        },
        {
          "start": 120,
          "end": 126,
          "audioStart": 7.94,
          "audioEnd": 8.2
        },
        {
          "start": 127,
          "end": 131,
          "audioStart": 8.2,
          "audioEnd": 8.5
        },
        {
          "start": 132,
          "end": 137,
          "audioStart": 8.5,
          "audioEnd": 8.78
        },
        {
          "start": 138,
          "end": 141,
          "audioStart": 8.78,
          "audioEnd": 9.02
        },
        {
          "start": 142,
          "end": 145,
          "audioStart": 9.02,
          "audioEnd": 9.14
        },
        {
          "start": 146,
          "end": 160,
          "audioStart": 9.14,
          "audioEnd": 9.6
        },
        {
          "start": 161,
          "end": 169,
          "audioStart": 9.6,
          "audioEnd": 10.28
        },
        {
          "start": 170,
          "end": 172,
          "audioStart": 10.28,
          "audioEnd": 10.54
        },
        {
          "start": 173,
          "end": 186,
          "audioStart": 10.54,
          "audioEnd": 11.5
        },
        {
          "start": 187,
          "end": 190,
          "audioStart": 11.5,
          "audioEnd": 11.82
        },
        {
          "start": 191,
          "end": 194,
          "audioStart": 11.82,
          "audioEnd": 11.96
        },
        {
          "start": 195,
          "end": 202,
          "audioStart": 11.96,
          "audioEnd": 12.36
        },
        {
          "start": 203,
          "end": 206,
          "audioStart": 12.36,
          "audioEnd": 12.64
        },
        {
          "start": 207,
          "end": 212,
          "audioStart": 12.64,
          "audioEnd": 12.9
        },
        {
          "start": 213,
          "end": 219,
          "audioStart": 12.9,
          "audioEnd": 13.66
        },
        {
          "start": 221,
          "end": 223,
          "audioStart": 14.3,
          "audioEnd": 14.42
        },
        {
          "start": 224,
          "end": 228,
          "audioStart": 14.42,
          "audioEnd": 15.14
        },
        {
          "start": 230,
          "end": 233,
          "audioStart": 15.3,
          "audioEnd": 15.44
        },
        {
          "start": 234,
          "end": 240,
          "audioStart": 15.44,
          "audioEnd": 15.72
        },
        {
          "start": 241,
          "end": 244,
          "audioStart": 15.72,
          "audioEnd": 15.86
        },
        {
          "start": 245,
          "end": 250,
          "audioStart": 15.86,
          "audioEnd": 16.06
        },
        {
          "start": 251,
          "end": 256,
          "audioStart": 16.06,
          "audioEnd": 16.48
        },
        {
          "start": 257,
          "end": 259,
          "audioStart": 16.48,
          "audioEnd": 16.66
        },
        {
          "start": 260,
          "end": 267,
          "audioStart": 16.66,
          "audioEnd": 16.98
        },
        {
          "start": 268,
          "end": 272,
          "audioStart": 16.98,
          "audioEnd": 17.26
        },
        {
          "start": 273,
          "end": 276,
          "audioStart": 17.26,
          "audioEnd": 17.38
        },
        {
          "start": 277,
          "end": 284,
          "audioStart": 17.38,
          "audioEnd": 17.7
        },
        {
          "start": 286,
          "end": 292,
          "audioStart": 17.7,
          "audioEnd": 18.02
        },
        {
          "start": 293,
          "end": 298,
          "audioStart": 18.02,
          "audioEnd": 18.6
        },
        {
          "start": 300,
          "end": 303,
          "audioStart": 18.6,
          "audioEnd": 18.86
        },
        {
          "start": 304,
          "end": 309,
          "audioStart": 18.86,
          "audioEnd": 19.2
        },
        {
          "start": 310,
          "end": 319,
          "audioStart": 19.58,
          "audioEnd": 19.98
        },
        {
          "start": 321,
          "end": 323,
          "audioStart": 20.18,
          "audioEnd": 20.28
        },
        {
          "start": 324,
          "end": 328,
          "audioStart": 20.28,
          "audioEnd": 21.02
        },
        {
          "start": 330,
          "end": 333,
          "audioStart": 21.14,
          "audioEnd": 21.28
        },
        {
          "start": 334,
          "end": 342,
          "audioStart": 21.28,
          "audioEnd": 21.6
        },
        {
          "start": 343,
          "end": 346,
          "audioStart": 21.6,
          "audioEnd": 21.78
        },
        {
          "start": 347,
          "end": 352,
          "audioStart": 21.78,
          "audioEnd": 21.94
        },
        {
          "start": 353,
          "end": 358,
          "audioStart": 21.94,
          "audioEnd": 22.38
        },
        {
          "start": 359,
          "end": 361,
          "audioStart": 22.38,
          "audioEnd": 22.54
        },
        {
          "start": 362,
          "end": 371,
          "audioStart": 22.54,
          "audioEnd": 22.94
        },
        {
          "start": 372,
          "end": 374,
          "audioStart": 22.94,
          "audioEnd": 23.24
        },
        {
          "start": 375,
          "end": 378,
          "audioStart": 23.24,
          "audioEnd": 23.42
        },
        {
          "start": 379,
          "end": 382,
          "audioStart": 23.42,
          "audioEnd": 23.76
        },
        {
          "start": 384,
          "end": 387,
          "audioStart": 24.0,
          "audioEnd": 24.14
        },
        {
          "start": 388,
          "end": 391,
          "audioStart": 24.14,
          "audioEnd": 24.26
        },
        {
          "start": 392,
          "end": 395,
          "audioStart": 24.26,
          "audioEnd": 24.4
        },
        {
          "start": 396,
          "end": 401,
          "audioStart": 24.4,
          "audioEnd": 24.68
        },
        {
          "start": 402,
          "end": 407,
          "audioStart": 24.68,
          "audioEnd": 24.94
        },
        {
          "start": 408,
          "end": 412,
          "audioStart": 24.94,
          "audioEnd": 25.24
        },
        {
          "start": 413,
          "end": 415,
          "audioStart": 25.24,
          "audioEnd": 25.44
        },
        {
          "start": 416,
          "end": 419,
          "audioStart": 25.44,
          "audioEnd": 25.6
        },
        {
          "start": 420,
          "end": 421,
          "audioStart": 25.6,
          "audioEnd": 25.7
        },
        {
          "start": 422,
          "end": 427,
          "audioStart": 25.7,
          "audioEnd": 25.92
        },
        {
          "start": 428,
          "end": 433,
          "audioStart": 25.92,
          "audioEnd": 26.5
        }
      ]
    },
    {
      "paragraphId": 2,
      "words": [
        {
          "start": 0,
          "end": 4,
          "audioStart": 27.26,
          "audioEnd": 27.56
        },
        {
          "start": 5,
          "end": 7,
          "audioStart": 27.56,
          "audioEnd": 27.7
        },
        {
          "start": 8,
          "end": 13,
          "audioStart": 27.7,
          "audioEnd": 27.94
        },
        {
          "start": 14,
          "end": 17,
          "audioStart": 27.94,
          "audioEnd": 28.38
        },
        {
          "start": 19,
          "end": 24,
          "audioStart": 28.5,
          "audioEnd": 28.58
        },
        {
          "start": 25,
          "end": 31,
          "audioStart": 28.58,
          "audioEnd": 28.98
        },
        {
          "start": 32,
          "end": 42,
          "audioStart": 28.98,
          "audioEnd": 29.6
        },
        {
          "start": 43,
          "end": 55,
          "audioStart": 29.6,
          "audioEnd": 30.44
        },
        {
          "start": 56,
          "end": 59,
          "audioStart": 30.44,
          "audioEnd": 30.9
        },
        {
          "start": 60,
          "end": 62,
          "audioStart": 30.9,
          "audioEnd": 31.04
        },
        {
          "start": 63,
          "end": 72,
          "audioStart": 31.04,
          "audioEnd": 31.44
        },
        {
          "start": 73,
          "end": 79,
          "audioStart": 31.44,
          "audioEnd": 31.94
        },
        {
          "start": 81,
          "end": 83,
          "audioStart": 32.44,
          "audioEnd": 32.64
        },
        {
          "start": 84,
          "end": 87,
          "audioStart": 32.64,
          "audioEnd": 32.78
        },
        {
          "start": 88,
          "end": 91,
          "audioStart": 32.78,
          "audioEnd": 33.0
        },
        {
          "start": 92,
          "end": 94,
          "audioStart": 33.0,
          "audioEnd": 33.18
        },
        {
          "start": 95,
          "end": 102,
          "audioStart": 33.18,
          "audioEnd": 33.6
        },
        {
          "start": 104,
          "end": 107,
          "audioStart": 33.84,
          "audioEnd": 33.94
        },
        {
          "start": 108,
          "end": 116,
          "audioStart": 33.94,
          "audioEnd": 34.36
        },
        {
          "start": 117,
          "end": 118,
          "audioStart": 34.36,
          "audioEnd": 34.56
        },
        {
          "start": 119,
          "end": 123,
          "audioStart": 34.56,
          "audioEnd": 34.9
        },
        {
          "start": 124,
          "end": 129,
          "audioStart": 34.9,
          "audioEnd": 35.26
        },
        {
          "start": 130,
          "end": 133,
          "audioStart": 35.26,
          "audioEnd": 35.62
        },
        {
          "start": 134,
          "end": 144,
          "audioStart": 35.62,
          "audioEnd": 36.04
        },
        {
          "start": 145,
          "end": 148,
          "audioStart": 36.04,
          "audioEnd": 36.26
        },
        {
          "start": 149,
          "end": 158,
          "audioStart": 36.26,
          "audioEnd": 36.72
        },
        {
          "start": 159,
          "end": 168,
          "audioStart": 36.72,
          "audioEnd": 37.44
        },
        {
          "start": 170,
          "end": 177,
          "audioStart": 38.06,
          "audioEnd": 38.4
        },
        {
          "start": 179,
          "end": 182,
          "audioStart": 38.68,
          "audioEnd": 38.74
        },
        {
          "start": 183,
          "end": 189,
          "audioStart": 38.74,
          "audioEnd": 39.08
        },
        {
          "start": 190,
          "end": 194,
          "audioStart": 39.08,
          "audioEnd": 39.34
        },
        {
          "start": 195,
          "end": 198,
          "audioStart": 39.34,
          "audioEnd": 39.58
        },
        {
          "start": 199,
          "end": 206,
          "audioStart": 39.58,
          "audioEnd": 39.92
        },
        {
          "start": 207,
          "end": 214,
          "audioStart": 39.92,
          "audioEnd": 40.32
        },
        {
          "start": 215,
          "end": 217,
          "audioStart": 40.32,
          "audioEnd": 40.52
        },
        {
          "start": 218,
          "end": 222,
          "audioStart": 40.52,
          "audioEnd": 40.74
        },
        {
          "start": 223,
          "end": 234,
          "audioStart": 40.74,
          "audioEnd": 41.24
        },
        {
          "start": 236,
          "end": 238,
          "audioStart": 41.74,
          "audioEnd": 41.84
        },
        {
          "start": 239,
          "end": 244,
          "audioStart": 41.84,
          "audioEnd": 42.08
        },
        {
          "start": 245,
          "end": 248,
          "audioStart": 42.08,
          "audioEnd": 42.28
        },
        {
          "start": 249,
          "end": 251,
          "audioStart": 42.28,
          "audioEnd": 42.44
        },
        {
          "start": 252,
          "end": 256,
          "audioStart": 42.44,
          "audioEnd": 42.72
        },
        {
          "start": 257,
          "end": 259,
          "audioStart": 42.72,
          "audioEnd": 43.06
        },
        {
          "start": 260,
          "end": 261,
          "audioStart": 43.06,
          "audioEnd": 43.16
        },
        {
          "start": 262,
          "end": 269,
          "audioStart": 43.16,
          "audioEnd": 43.46
        },
        {
          "start": 271,
          "end": 274,
          "audioStart": 44.08,
          "audioEnd": 44.42
        },
        {
          "start": 275,
          "end": 279,
          "audioStart": 44.42,
          "audioEnd": 44.7
        },
        {
          "start": 280,
          "end": 283,
          "audioStart": 44.7,
          "audioEnd": 44.86
        },
        {
          "start": 284,
          "end": 289,
          "audioStart": 44.86,
          "audioEnd": 45.06
        },
        {
          "start": 290,
          "end": 293,
          "audioStart": 45.06,
          "audioEnd": 45.3
        },
        {
          "start": 294,
          "end": 300,
          "audioStart": 45.3,
          "audioEnd": 45.52
        },
        {
          "start": 301,
          "end": 303,
          "audioStart": 45.52,
          "audioEnd": 45.74
        },
        {
          "start": 304,
          "end": 311,
          "audioStart": 45.74,
          "audioEnd": 46.04
        },
        {
          "start": 312,
          "end": 315,
          "audioStart": 46.04,
          "audioEnd": 46.26
        },
        {
          "start": 316,
          "end": 322,
          "audioStart": 46.26,
          "audioEnd": 46.58
        },
        {
          "start": 323,
          "end": 331,
          "audioStart": 46.58,
          "audioEnd": 47.2
        },
        {
          "start": 332,
          "end": 339,
          "audioStart": 47.2,
          "audioEnd": 47.44
        },
        {
          "start": 340,
          "end": 347,
          "audioStart": 47.44,
          "audioEnd": 47.92
        },
        {
          "start": 348,
          "end": 350,
          "audioStart": 47.92,
          "audioEnd": 48.14
        },
        {
          "start": 351,
          "end": 356,
          "audioStart": 48.14,
          "audioEnd": 48.44
        },
        {
          "start": 358,
          "end": 360,
          "audioStart": 49.08,
          "audioEnd": 49.18
        },
        {
          "start": 361,
          "end": 367,
          "audioStart": 49.18,
          "audioEnd": 49.44
        },
        {
          "start": 369,
          "end": 375,
          "audioStart": 49.74,
          "audioEnd": 50.04
        },
        {
          "start": 376,
          "end": 384,
          "audioStart": 50.04,
          "audioEnd": 50.4
        },
        {
          "start": 385,
          "end": 387,
          "audioStart": 50.4,
          "audioEnd": 50.66
        },
        {
          "start": 388,
          "end": 392,
          "audioStart": 50.66,
          "audioEnd": 50.78
        },
        {
          "start": 393,
          "end": 398,
          "audioStart": 50.78,
          "audioEnd": 51.1
        },
        {
          "start": 399,
          "end": 405,
          "audioStart": 51.1,
          "audioEnd": 51.5
        },
        {
          "start": 406,
          "end": 409,
          "audioStart": 51.5,
          "audioEnd": 51.78
        },
        {
          "start": 410,
          "end": 413,
          "audioStart": 51.78,
          "audioEnd": 52.02
        },
        {
          "start": 414,
          "end": 423,
          "audioStart": 52.02,
          "audioEnd": 52.42
        },
        {
          "start": 424,
          "end": 429,
          "audioStart": 52.42,
          "audioEnd": 52.88
        }
      ]
    },
    {
      "paragraphId": 3,
      "words": [
        {
          "start": 0,
          "end": 2,
          "audioStart": 53.76,
          "audioEnd": 54.32
        },
        {
          "start": 3,
          "end": 7,
          "audioStart": 54.32,
          "audioEnd": 54.88
        },
        {
          "start": 9,
          "end": 15,
          "audioStart": 55.4,
          "audioEnd": 55.62
        },
        {
          "start": 16,
          "end": 20,
          "audioStart": 55.62,
          "audioEnd": 55.84
        },
        {
          "start": 21,
          "end": 25,
          "audioStart": 55.84,
          "audioEnd": 56.06
        },
        {
          "start": 26,
          "end": 33,
          "audioStart": 56.06,
          "audioEnd": 56.42
        },
        {
          "start": 35,
          "end": 38,
          "audioStart": 56.42,
          "audioEnd": 57.1
        },
        {
          "start": 39,
          "end": 44,
          "audioStart": 57.1,
          "audioEnd": 57.34
        },
        {
          "start": 45,
          "end": 50,
          "audioStart": 57.34,
          "audioEnd": 57.76
        },
        {
          "start": 51,
          "end": 53,
          "audioStart": 57.76,
          "audioEnd": 57.92
        },
        {
          "start": 54,
          "end": 59,
          "audioStart": 57.92,
          "audioEnd": 58.22
        },
        {
          "start": 60,
          "end": 62,
          "audioStart": 58.22,
          "audioEnd": 58.48
        },
        {
          "start": 63,
          "end": 68,
          "audioStart": 58.48,
          "audioEnd": 58.82
        },
        {
          "start": 69,
          "end": 71,
          "audioStart": 58.82,
          "audioEnd": 58.96
        },
        {
          "start": 72,
          "end": 75,
          "audioStart": 58.96,
          "audioEnd": 59.04
        },
        {
          "start": 76,
          "end": 84,
          "audioStart": 59.04,
          "audioEnd": 60.18
        },
        {
          "start": 86,
          "end": 89,
          "audioStart": 60.3,
          "audioEnd": 60.42
        },
        {
          "start": 90,
          "end": 94,
          "audioStart": 60.42,
          "audioEnd": 60.68
        },
        {
          "start": 95,
          "end": 97,
          "audioStart": 60.68,
          "audioEnd": 60.82
        },
        {
          "start": 98,
          "end": 101,
          "audioStart": 60.82,
          "audioEnd": 60.92
        },
        {
          "start": 102,
          "end": 112,
          "audioStart": 60.92,
          "audioEnd": 61.4
        },
        {
          "start": 113,
          "end": 115,
          "audioStart": 61.4,
          "audioEnd": 61.6
        },
        {
          "start": 116,
          "end": 121,
          "audioStart": 61.6,
          "audioEnd": 61.96
        },
        {
          "start": 123,
          "end": 126,
          "audioStart": 62.58,
          "audioEnd": 62.8
        },
        {
          "start": 127,
          "end": 134,
          "audioStart": 62.8,
          "audioEnd": 63.12
        },
        {
          "start": 135,
          "end": 142,
          "audioStart": 63.12,
          "audioEnd": 63.54
        },
        {
          "start": 143,
          "end": 145,
          "audioStart": 63.54,
          "audioEnd": 63.78
        },
        {
          "start": 146,
          "end": 149,
          "audioStart": 63.78,
          "audioEnd": 63.92
        },
        {
          "start": 150,
          "end": 157,
          "audioStart": 63.92,
          "audioEnd": 64.32
        },
        {
          "start": 159,
          "end": 164,
          "audioStart": 64.72,
          "audioEnd": 64.98
        },
        {
          "start": 165,
          "end": 172,
          "audioStart": 64.98,
          "audioEnd": 65.34
        },
        {
          "start": 173,
          "end": 177,
          "audioStart": 65.34,
          "audioEnd": 65.58
        },
        {
          "start": 178,
          "end": 182,
          "audioStart": 65.58,
          "audioEnd": 65.84
        },
        {
          "start": 183,
          "end": 186,
          "audioStart": 65.84,
          "audioEnd": 66.02
        },
        {
          "start": 187,
          "end": 192,
          "audioStart": 66.02,
          "audioEnd": 66.3
        },
        {
          "start": 194,
          "end": 201,
          "audioStart": 66.46,
          "audioEnd": 66.64
        },
        {
          "start": 202,
          "end": 205,
          "audioStart": 66.64,
          "audioEnd": 66.86
        },
        {
          "start": 206,
          "end": 209,
          "audioStart": 66.86,
          "audioEnd": 66.98
        },
        {
          "start": 210,
          "end": 214,
          "audioStart": 66.98,
          "audioEnd": 67.2
        },
        {
          "start": 215,
          "end": 221,
          "audioStart": 67.2,
          "audioEnd": 67.44
        },
        {
          "start": 222,
          "end": 227,
          "audioStart": 67.44,
          "audioEnd": 67.74
        },
        {
          "start": 229,
          "end": 232,
          "audioStart": 68.18,
          "audioEnd": 68.34
        },
        {
          "start": 233,
          "end": 241,
          "audioStart": 68.34,
          "audioEnd": 68.7
        },
        {
          "start": 242,
          "end": 244,
          "audioStart": 68.7,
          "audioEnd": 68.94
        },
        {
          "start": 245,
          "end": 246,
          "audioStart": 68.94,
          "audioEnd": 69.04
        },
        {
          "start": 247,
          "end": 253,
          "audioStart": 69.04,
          "audioEnd": 69.34
        },
        {
          "start": 254,
          "end": 258,
          "audioStart": 69.34,
          "audioEnd": 69.72
        },
        {
          "start": 259,
          "end": 261,
          "audioStart": 69.72,
          "audioEnd": 69.9
        },
        {
          "start": 262,
          "end": 267,
          "audioStart": 69.9,
          "audioEnd": 70.2
        },
        {
          "start": 269,
          "end": 275,
          "audioStart": 70.62,
          "audioEnd": 70.94
        },
        {
          "start": 277,
          "end": 280,
          "audioStart": 71.24,
          "audioEnd": 71.34
        },
        {
          "start": 281,
          "end": 284,
          "audioStart": 71.34,
          "audioEnd": 71.64
        },
        {
          "start": 286,
          "end": 293,
          "audioStart": 72.4,
          "audioEnd": 72.68
        },
        {
          "start": 294,
          "end": 299,
          "audioStart": 72.68,
          "audioEnd": 72.96
        },
        {
          "start": 300,
          "end": 309,
          "audioStart": 72.96,
          "audioEnd": 73.38
        },
        {
          "start": 310,
          "end": 316,
          "audioStart": 73.38,
          "audioEnd": 73.62
        },
        {
          "start": 317,
          "end": 327,
          "audioStart": 73.62,
          "audioEnd": 74.08
        },
        {
          "start": 329,
          "end": 332,
          "audioStart": 74.5,
          "audioEnd": 74.7
        },
        {
          "start": 333,
          "end": 342,
          "audioStart": 74.7,
          "audioEnd": 75.14
        },
        {
          "start": 343,
          "end": 356,
          "audioStart": 75.14,
          "audioEnd": 75.72
        },
        {
          "start": 357,
          "end": 361,
          "audioStart": 75.72,
          "audioEnd": 76.12
        },
        {
          "start": 362,
          "end": 364,
          "audioStart": 76.12,
          "audioEnd": 76.3
        },
        {
          "start": 365,
          "end": 368,
          "audioStart": 76.3,
          "audioEnd": 76.44
        },
        {
          "start": 369,
          "end": 381,
          "audioStart": 76.44,
          "audioEnd": 77.16
        },
        {
          "start": 383,
          "end": 385,
          "audioStart": 77.72,
          "audioEnd": 78.06
        },
        {
          "start": 386,
          "end": 390,
          "audioStart": 78.06,
          "audioEnd": 79.04
        },
        {
          "start": 392,
          "end": 395,
          "audioStart": 79.56,
          "audioEnd": 79.68
        },
        {
          "start": 396,
          "end": 404,
          "audioStart": 79.68,
          "audioEnd": 80.04
        },
        {
          "start": 405,
          "end": 408,
          "audioStart": 80.04,
          "audioEnd": 80.22
        },
        {
          "start": 409,
          "end": 416,
          "audioStart": 80.22,
          "audioEnd": 80.5
        },
        {
          "start": 417,
          "end": 423,
          "audioStart": 80.5,
          "audioEnd": 80.94
        },
        {
          "start": 424,
          "end": 426,
          "audioStart": 80.94,
          "audioEnd": 81.16
        },
        {
          "start": 427,
          "end": 430,
          "audioStart": 81.16,
          "audioEnd": 81.24
        },
        {
          "start": 431,
          "end": 439,
          "audioStart": 81.24,
          "audioEnd": 81.54
        },
        {
          "start": 440,
          "end": 448,
          "audioStart": 81.54,
          "audioEnd": 82.2
        },
        {
          "start": 449,
          "end": 460,
          "audioStart": 82.2,
          "audioEnd": 82.66
        },
        {
          "start": 462,
          "end": 465,
          "audioStart": 83.2,
          "audioEnd": 83.26
        },
        {
          "start": 466,
          "end": 475,
          "audioStart": 83.26,
          "audioEnd": 83.66
        },
        {
          "start": 476,
          "end": 480,
          "audioStart": 83.66,
          "audioEnd": 84.02
        },
        {
          "start": 482,
          "end": 485,
          "audioStart": 84.16,
          "audioEnd": 84.3
        },
        {
          "start": 486,
          "end": 490,
          "audioStart": 84.3,
          "audioEnd": 84.54
        },
        {
          "start": 491,
          "end": 497,
          "audioStart": 84.54,
          "audioEnd": 84.98
        },
        {
          "start": 498,
          "end": 500,
          "audioStart": 84.98,
          "audioEnd": 85.2
        },
        {
          "start": 501,
          "end": 504,
          "audioStart": 85.2,
          "audioEnd": 85.3
        },
        {
          "start": 505,
          "end": 517,
          "audioStart": 85.3,
          "audioEnd": 85.96
        },
        {
          "start": 518,
          "end": 526,
          "audioStart": 85.96,
          "audioEnd": 86.48
        },
        {
          "start": 527,
          "end": 538,
          "audioStart": 86.48,
          "audioEnd": 87.1
        },
        {
          "start": 540,
          "end": 542,
          "audioStart": 87.64,
          "audioEnd": 88.04
        },
        {
          "start": 543,
          "end": 546,
          "audioStart": 88.04,
          "audioEnd": 88.18
        },
        {
          "start": 547,
          "end": 550,
          "audioStart": 88.18,
          "audioEnd": 88.52
        },
        {
          "start": 551,
          "end": 556,
          "audioStart": 88.52,
          "audioEnd": 88.94
        },
        {
          "start": 557,
          "end": 560,
          "audioStart": 88.94,
          "audioEnd": 89.14
        },
        {
          "start": 561,
          "end": 567,
          "audioStart": 89.14,
          "audioEnd": 89.46
        },
        {
          "start": 568,
          "end": 570,
          "audioStart": 89.46,
          "audioEnd": 89.68
        },
        {
          "start": 571,
          "end": 575,
          "audioStart": 89.68,
          "audioEnd": 90.82
        },
        {
          "start": 576,
          "end": 580,
          "audioStart": 90.82,
          "audioEnd": 91.2
        },
        {
          "start": 581,
          "end": 584,
          "audioStart": 91.2,
          "audioEnd": 91.4
        },
        {
          "start": 585,
          "end": 588,
          "audioStart": 91.4,
          "audioEnd": 91.62
        },
        {
          "start": 589,
          "end": 595,
          "audioStart": 91.62,
          "audioEnd": 92.0
        },
        {
          "start": 596,
          "end": 601,
          "audioStart": 92.0,
          "audioEnd": 92.56
        },
        {
          "start": 603,
          "end": 606,
          "audioStart": 92.9,
          "audioEnd": 92.96
        },
        {
          "start": 607,
          "end": 612,
          "audioStart": 92.96,
          "audioEnd": 93.12
        },
        {
          "start": 613,
          "end": 618,
          "audioStart": 93.12,
          "audioEnd": 93.34
        },
        {
          "start": 619,
          "end": 625,
          "audioStart": 93.34,
          "audioEnd": 93.72
        },
        {
          "start": 626,
          "end": 629,
          "audioStart": 93.72,
          "audioEnd": 93.96
        },
        {
          "start": 630,
          "end": 637,
          "audioStart": 93.96,
          "audioEnd": 94.32
        },
        {
          "start": 638,
          "end": 641,
          "audioStart": 94.32,
          "audioEnd": 94.66
        },
        {
          "start": 642,
          "end": 650,
          "audioStart": 94.66,
          "audioEnd": 95.08
        },
        {
          "start": 651,
          "end": 658,
          "audioStart": 95.08,
          "audioEnd": 95.6
        }
      ]
    }
  ]
};
