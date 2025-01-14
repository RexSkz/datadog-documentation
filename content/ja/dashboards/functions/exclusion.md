---
aliases:
- /ja/graphing/functions/exclusion/
title: 除外
---

## null を除外

| 関数         | 説明                                                    | 例                                        |
| ---------------- | -------------------------------------------------------------- | ---------------------------------------------- |
| `exclude_null()` | グラフまたはトップリストから、タグの値に N/A を持つグループを削除します。 | `exclude_null(avg:system.load.1{*} by {host})` |

たとえば、`account` と `region` の 2 つのタグを持つメトリクスがあるとします。`account` には、3 種類の値 (`prod`、`build`、`N/A`)、`region` には 4 種類の値 (`us-east-1`、`us-west-1`、`eu-central-1`、`N/A`) が指定される可能性があります。

このメトリクスを時系列としてグラフ化すると、3 x 4 = 12 行が作成されます。`exclude_null()` を適用すると、N/A の値を持つ _すべての_ タグの組み合わせの行が削除されるため、2 x 3 = 6 グループになります。

## クランプ

| 関数      | 説明                                                          | 例                                |
| ------------- | -------------------------------------------------------------------- | -------------------------------------- |
| `clamp_min()` | 閾値 _以下_ のメトリクス値を、その値と等しくなるように設定します。 | `clamp_min(avg:system.load.1{*}, 100)` |
| `clamp_max()` | 閾値 _以上_ のメトリクス値を、その値と等しくなるように設定します。  | `clamp_max(avg:system.load.1{*}, 100)` |

しきい値を追加します。`clamp_min()` は、すべてのしきい値以下のデータポイントをそのしきい値と等しく設定し、`clamp_max()` はしきい値以上のデータポイントをそのしきい値と等しく設定します。

注: `clamp_min(values, threshold)` および `clamp_max(values, threshold)` は、値内の `NaN` をすべて `threshold` に設定します。

この動作を回避するには、`clamp_min()` / `clamp_max()` 関数の前に `default_zero()` を適用してください。

## カットオフ

| 関数       | 説明                                     | 例                                 |
| -------------- | ----------------------------------------------- | --------------------------------------- |
| `cutoff_min()` | しきい値_を下回る_メトリクスを NaN に置き換えます。 | `cutoff_min(avg:system.load.1{*}, 100)` |
| `cutoff_max()` | しきい値_を上回る_メトリクスを NaN に置き換えます。  | `cutoff_max(avg:system.load.1{*}, 100)` |

しきい値を追加します。`cutoff_min()` は、このしきい値より小さいメトリクス値をすべて `NaN` に置き換え、 `cutoff_max()` は、このしきい値より大きいメトリクス値をすべて `NaN` に置き換えます。cutoff 関数は、しきい値と**等しい**値を置き換えることはありません。

**ヒント**: クランプおよびカットオフ関数の両方において、選択した閾値を確認できると便利です。この値を表示するには、ダッシュボードに[水平マーカーを設定][1]します。

## その他の関数

{{< whatsnext desc="他に利用できる関数を参照します。" >}}
{{< nextlink href="/dashboards/functions/arithmetic" >}}算術: メトリクスに対して算術演算を実行します。{{< /nextlink >}}
{{< nextlink href="/dashboards/functions/algorithms" >}}アルゴリズム: メトリクスに異常値や外れ値の検出機能を実装します。{{< /nextlink >}}
{{< nextlink href="/dashboards/functions/count" >}}カウント: メトリクスの 0 以外または null 以外の値をカウントします。{{< /nextlink >}}
{{< nextlink href="/dashboards/functions/interpolation" >}}補間: メトリクスにデフォルト値を挿入または設定します。{{< /nextlink >}}
{{< nextlink href="/dashboards/functions/rank" >}}ランク: メトリクスの一部のみを選択します。{{< /nextlink >}}
{{< nextlink href="/dashboards/functions/rate" >}}レート: メトリクスに対してカスタム微分係数を計算します。{{< /nextlink >}}
{{< nextlink href="/dashboards/functions/regression" >}}回帰: メトリクスに何らかの機械学習関数を適用します。{{< /nextlink >}}
{{< nextlink href="/dashboards/functions/rollup" >}}ロールアップ: メトリクスに使用される元ポイントの数を制御します。{{< /nextlink >}}
{{< nextlink href="/dashboards/functions/smoothing" >}}スムーシング: メトリクスの変動を滑らかにします。{{< /nextlink >}}
{{< nextlink href="/dashboards/functions/timeshift" >}}タイムシフト: メトリクスのデータポイントをタイムラインに沿って移動させます。{{< /nextlink >}}
{{< /whatsnext >}}

[1]: https://www.datadoghq.com/blog/customize-graphs-dashboards-graph-markers/