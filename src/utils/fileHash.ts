// 计算文件 Hash（使用 SparkMD5）
import SparkMD5 from 'spark-md5';

export const calculateFileHash = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunkSize = 2 * 1024 * 1024; // 2MB per chunk for hashing
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      if (e.target?.result) {
        spark.append(e.target.result as ArrayBuffer);
        currentChunk++;

        if (currentChunk < chunks) {
          loadNext();
        } else {
          const hash = spark.end();
          resolve(hash);
        }
      }
    };

    fileReader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    const loadNext = () => {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      fileReader.readAsArrayBuffer(file.slice(start, end));
    };

    loadNext();
  });
};

// 将文件切分为分片
export const createFileChunks = (file: File, chunkSize: number = 5 * 1024 * 1024): Blob[] => {
  const chunks: Blob[] = [];
  let start = 0;

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    chunks.push(file.slice(start, end));
    start = end;
  }

  return chunks;
};
