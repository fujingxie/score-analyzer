import * as XLSX from 'xlsx';
import _ from 'lodash';

// 1. 读取 Excel 文件
export const readExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

// 2. 核心计算引擎
export const calculateStats = (studentList, config) => {
    // config 示例: { subjects: ['语文', '数学'], fullMarks: { '语文': 150, '数学': 150 }, passLines: { '语文': 90 } }

    const subjects = config.subjects;

    // 基础统计容器
    let stats = {
        totalStudents: studentList.length,
        subjectStats: {}, // 单科统计
        overallStats: {}  // 总分统计
    };

    // 初始化科目统计对象
    subjects.forEach(sub => {
        stats.subjectStats[sub] = {
            sum: 0, max: 0, min: 999, passCount: 0, excellentCount: 0, scores: []
        };
    });

    // 遍历所有学生计算
    studentList.forEach(student => {
        let totalScore = 0;

        subjects.forEach(sub => {
            const score = Number(student[sub]) || 0;
            const fullMark = config.fullMarks[sub] || 100;
            const passLine = config.passLines?.[sub] || (fullMark * 0.6); // 默认60%及格
            const excellentLine = fullMark * 0.85; // 默认85%优秀

            // 单科累加
            stats.subjectStats[sub].sum += score;
            stats.subjectStats[sub].scores.push(score);
            if (score > stats.subjectStats[sub].max) stats.subjectStats[sub].max = score;
            if (score < stats.subjectStats[sub].min) stats.subjectStats[sub].min = score;
            if (score >= passLine) stats.subjectStats[sub].passCount++;
            if (score >= excellentLine) stats.subjectStats[sub].excellentCount++;

            totalScore += score;
        });

        student['总分'] = totalScore;
    });

    // 计算平均分、及格率等
    subjects.forEach(sub => {
        const s = stats.subjectStats[sub];
        s.avg = (s.sum / stats.totalStudents).toFixed(1);
        s.passRate = ((s.passCount / stats.totalStudents) * 100).toFixed(1) + '%';
        s.excellentRate = ((s.excellentCount / stats.totalStudents) * 100).toFixed(1) + '%';
    });

    // 对学生按总分排序（生成排名）
    const rankedStudents = _.orderBy(studentList, ['总分'], ['desc']).map((stu, index) => ({
        ...stu,
        rank: index + 1
    }));

    return { stats, rankedStudents };
};
// ... existing code ...

/**
 * 核心算法：年级/多班级分析
 * @param {Array} allStudents 所有学生数据
 * @param {Object} config 配置 { subjects: [], fullMarks: {}, ... }
 */
export const calculateGradeStats = (allStudents, config) => {
    const subjects = config.subjects;

    // 1. 预处理：计算每个学生的总分
    // 视频里的逻辑是：必须有“班级”这一列，如果没有，我们默认归为“未知班级”
    const processedStudents = allStudents.map(stu => {
        let total = 0;
        subjects.forEach(sub => {
            // 确保是数字
            const score = Number(stu[sub]) || 0;
            stu[sub] = score;
            total += score;
        });
        stu['总分'] = total;
        stu['班级'] = stu['班级'] ? String(stu['班级']) : '未知班级'; // 强制转字符串统一格式
        return stu;
    });

    // 2. 计算【年级总排名】
    // 使用 lodash 的 orderBy 进行降序排列
    const gradeRanked = _.orderBy(processedStudents, ['总分'], ['desc']).map((stu, idx) => ({
        ...stu,
        '年级排名': idx + 1
    }));

    // 3. 按班级分组，计算【班级对比数据】
    const classGroups = _.groupBy(gradeRanked, '班级');
    const classStats = [];

    // 遍历每个班级进行统计
    for (const className in classGroups) {
        const classStudents = classGroups[className];
        const studentCount = classStudents.length;

        // 计算该班级的总分平均分
        const totalScoreSum = _.sumBy(classStudents, '总分');
        const totalAvg = (totalScoreSum / studentCount).toFixed(1);

        // 统计该班级各科的表现
        const subStats = {};
        subjects.forEach(sub => {
            const subSum = _.sumBy(classStudents, sub);
            subStats[sub] = (subSum / studentCount).toFixed(1); // 该班该科平均分
        });

        classStats.push({
            className: className,
            studentCount: studentCount,
            totalAvg: Number(totalAvg), // 班级总平均分
            subStats: subStats          // 各科平均分对象
        });
    }

    // 对班级按总平均分排序（第一名班级 vs 最后一名）
    const rankedClassStats = _.orderBy(classStats, ['totalAvg'], ['desc']);

    return {
        gradeRanked,      // 包含年级排名的学生列表
        classStats: rankedClassStats, // 班级维度的统计
        subjects
    };
};
